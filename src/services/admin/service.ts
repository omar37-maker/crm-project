import { uuidv4 } from "zod";
import { dbfindUserByEmail, dbCreateProfile, dblistAllUsers, dbfindUserById, dbUpdateUser, dbDeactivateUser, dbReactivateUser } from "./db";
import { CreateUserSchema, UpdateUserSchema } from "./schema";
import { AuthError } from "@supabase/auth-js";
import supabaseAdmin from "./../../lib/supabase/admin";
import supabase from "@/lib/supabase/client";
import { resend } from "@/lib/resend";
import { generateInviteEmailHTML } from "./helpers";
import { Update } from "next/dist/build/swc/types";
import { th } from "date-fns/locale";

export class AdminServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AdminServiceError";
  }
}

export async function createUser(data: CreateUserSchema) {
  const existingUser = await dbfindUserByEmail(data.email);
  if (existingUser) throw new AdminServiceError("user already exists.", 409);

  const tempPassword = uuidv4().toString();
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    console.error("Supabase auth error:", authError);
    throw new AdminServiceError("Failed to create user.", 500);
  }

  const profile = await dbCreateProfile({
    id: authData.user.id,
    email: data.email,
    name: data.name,
    role: data.role,
  });

  const { data: magicLinkData, error: magicLinkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: data.email,
    });

  if (magicLinkError || !magicLinkData.properties?.action_link) {
    console.error("Supabase magic link error:", magicLinkError);
    return profile
    }
    
    const magicLink = magicLinkData.properties.action_link;
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: "Your invite to the CRM app",
      html: generateInviteEmailHTML(data.name, magicLink),
    });
    return profile;
}

export async function listUsers() {
    return await dblistAllUsers();
}

export async function getUserById(id: string) { 
    const user = await dbfindUserById(id);
    if (!user) { 
        throw new AdminServiceError("User not found.", 404);
    }  
    return user;
}


export async function updateUserById(
    adminId: string,
    targetUserId: string,
    data: UpdateUserSchema
) {
    if (adminId === targetUserId) { 
        throw new AdminServiceError("You cannot change your own role.", 400);
    }

    const target = await dbfindUserById(targetUserId);
    if (!target) { 
        throw new AdminServiceError("Target user not found.", 404);
    }

    return dbUpdateUser(targetUserId, data);
}

export async function deactivateUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
        throw new AdminServiceError("You cannot deactivate your own account.", 400);
    }
    const target = await dbfindUserById(targetUserId);
    if (!target) {
        throw new AdminServiceError("Target user not found.", 404);
    }
    if (!target.isActive) {
        throw new AdminServiceError("User is already deactivated.", 400);
    }
    return dbDeactivateUser(targetUserId);
}


export async function reactivateUser(targetUserId: string) { 
    const target = await dbfindUserById(targetUserId);
    if (!target) {
        throw new AdminServiceError("Target user not found.", 404);
    }
    if (target.isActive) { 
        throw new AdminServiceError("User is already active.", 400);
    }
    return await dbReactivateUser(targetUserId);
}
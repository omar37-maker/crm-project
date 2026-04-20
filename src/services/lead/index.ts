import { createLead, reassignLeads, updateLead } from "./service";

export const LeadService = {
  createLead: createLead,
  updateLead: updateLead,
  reassignLeads: reassignLeads,
} as const;

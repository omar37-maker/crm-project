import { CallFollowUp } from "@/services/ai/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FollowupReview({ followup }: { followup: CallFollowUp }) {
  return (
    <div className="space-y-4">
      {/* Call Script */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Call Script</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opening */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Opening
            </p>
            <p className="text-sm">{followup.callScript.opening}</p>
          </div>

          {/* Questions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Questions to Ask
            </p>
            <ol className="space-y-2">
              {followup.callScript.questions.map((question, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-semibold text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Objection Handlers */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Objection Handlers
            </p>
            <div className="space-y-2">
              {followup.callScript.objectionHandlers.map((handler, i) => (
                <div key={i} className="rounded border p-3">
                  <p className="text-sm font-medium">{handler.objection}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {handler.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recommended Next Step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{followup.recommendedNextStep}</p>
        </CardContent>
      </Card>

      {/* Suggested Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Suggested Reminder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm font-medium">
            {followup.suggestedReminder.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {followup.suggestedReminder.note}
          </p>
          <p className="text-xs text-muted-foreground">
            Due:{" "}
            {new Date(
              followup.suggestedReminder.suggestedDueAt,
            ).toLocaleDateString("en-US")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

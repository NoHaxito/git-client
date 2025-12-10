import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";

export function EditorSettings() {
  const {
    settings,
    updateEditorGitBlameShow,
    updateEditorGitBlameExtendedDetails,
    updateEditorMinimapShow,
  } = useSettings();

  return (
    <FieldGroup>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel>Show minimap</FieldLabel>
          <FieldDescription>
            Display a minimap of the code in the editor.
          </FieldDescription>
        </FieldContent>
        <Switch
          checked={settings.editor.minimap.show}
          onCheckedChange={updateEditorMinimapShow}
        />
      </Field>
      <FieldSet>
        <FieldLegend>Git Blame</FieldLegend>
        <FieldDescription>
          Configure the git blame feature in the editor.
        </FieldDescription>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Show git blame</FieldLabel>
            <FieldDescription>
              Display git blame information for each line in the editor.
            </FieldDescription>
          </FieldContent>
          <Switch
            checked={settings.editor.gitBlame.show}
            onCheckedChange={updateEditorGitBlameShow}
          />
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Extended details on hover</FieldLabel>
            <FieldDescription>
              Show additional git blame details when hovering over a line.
            </FieldDescription>
          </FieldContent>
          <Switch
            checked={settings.editor.gitBlame.extendedDetails}
            onCheckedChange={updateEditorGitBlameExtendedDetails}
          />
        </Field>
      </FieldSet>
    </FieldGroup>
  );
}

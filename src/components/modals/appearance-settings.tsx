/** biome-ignore-all lint/a11y/noLabelWithoutControl: NOT NECCESSARY FOR THIS COMPONENT */
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
import { type Theme, useTheme } from "../theme-provider";
import { Label } from "../ui/label";

const languages = [
  { code: "en", label: "English", flag: "gb" },
  { code: "es", label: "Español", flag: "es" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "zh", label: "中文", flag: "cn" },
] as const;

function getLanguageByCode(code: string) {
  return languages.find((lang) => lang.code === code) || languages[0];
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateAppearanceLanguage } = useSettings();

  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel>Theme</FieldLabel>
          <FieldContent>
            <RadioGroup
              className="grid grid-cols-2 gap-4 lg:grid-cols-3"
              defaultValue="system"
              onValueChange={(value) => setTheme(value as Theme)}
              value={theme}
            >
              <Label className="flex flex-col items-center justify-center gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50">
                <Radio className="sr-only" value="light" />
                <svg
                  className="rounded border"
                  fill="none"
                  height="80"
                  viewBox="0 0 128 80"
                  width="128"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#ffffff" height="80" width="128" />
                  <rect fill="#f3f4f6" height="16" width="128" x="0" y="0" />
                  <rect fill="#e5e7eb" height="8" width="96" x="16" y="24" />
                  <rect fill="#e5e7eb" height="8" width="64" x="16" y="40" />
                  <rect fill="#e5e7eb" height="8" width="80" x="16" y="56" />
                </svg>
                <span className="font-medium text-sm">Light</span>
              </Label>
              <Label className="flex flex-col items-center justify-center gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50">
                <Radio className="sr-only" value="dark" />
                <svg
                  className="rounded border"
                  fill="none"
                  height="80"
                  viewBox="0 0 128 80"
                  width="128"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#171717" height="80" width="128" />
                  <rect fill="#262626" height="16" width="128" x="0" y="0" />
                  <rect fill="#525252" height="8" width="96" x="16" y="24" />
                  <rect fill="#525252" height="8" width="64" x="16" y="40" />
                  <rect fill="#525252" height="8" width="80" x="16" y="56" />
                </svg>
                <span className="font-medium text-sm">Dark</span>
              </Label>
              <Label className="flex flex-col items-center justify-center gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50">
                <Radio className="sr-only" value="system" />
                <svg
                  className="rounded border"
                  fill="none"
                  height="80"
                  viewBox="0 0 128 80"
                  width="128"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#ffffff" height="80" width="64" />
                  <rect fill="#171717" height="80" width="64" x="64" />
                  <rect fill="#f3f4f6" height="16" width="64" x="0" y="0" />
                  <rect fill="#262626" height="16" width="64" x="64" y="0" />
                  <rect fill="#e5e7eb" height="8" width="48" x="8" y="24" />
                  <rect fill="#525252" height="8" width="48" x="72" y="24" />
                  <rect fill="#e5e7eb" height="8" width="32" x="8" y="40" />
                  <rect fill="#525252" height="8" width="32" x="72" y="40" />
                </svg>
                <span className="font-medium text-sm">System</span>
              </Label>
            </RadioGroup>
            <FieldDescription>
              Choose how the application appears to you.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Language</FieldLabel>
            <FieldDescription>
              Choose your preferred language for the interface.
            </FieldDescription>
          </FieldContent>
          <Select
            onValueChange={updateAppearanceLanguage}
            value={settings.appearance.language}
          >
            <SelectTrigger>
              <SelectValue>
                {(() => {
                  const selectedLang = getLanguageByCode(
                    settings.appearance.language
                  );
                  return (
                    <div className="flex items-center gap-2">
                      <img
                        alt={selectedLang.label}
                        className="size-4"
                        height="16"
                        src={`https://hatscripts.github.io/circle-flags/flags/${selectedLang.flag}.svg`}
                        width="16"
                      />
                      <span>{selectedLang.label}</span>
                    </div>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectPopup>
              {languages.map((lang) => (
                <SelectItem
                  checkPosition="right"
                  className="data-selected:bg-accent data-selected:text-accent-foreground"
                  key={lang.code}
                  value={lang.code}
                >
                  <div className="flex items-center gap-2">
                    <img
                      alt={lang.label}
                      className="size-4"
                      height="16"
                      src={`https://hatscripts.github.io/circle-flags/flags/${lang.flag}.svg`}
                      width="16"
                    />
                    <span>{lang.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

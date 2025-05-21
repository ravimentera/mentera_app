import { FormField } from "@/app/(auth)/register/config/formConfig";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { cn } from "@/lib/utils";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DynamicFormProps {
  title: string;
  description: string;
  fields: FormField[];
  initialValues: Record<string, any>;
  validationSchema: any;
  onSubmit: (values: any, helpers: FormikHelpers<any>) => void | Promise<void>;
  previousStep?: string;
  nextStep?: string;
  isLastStep?: boolean;
  className?: string;
}

export function DynamicForm({
  title,
  description,
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  previousStep,
  nextStep,
  isLastStep = false,
  className,
}: DynamicFormProps) {
  const router = useRouter();

  return (
    <div className={cn("w-full bg-white rounded-[20px] shadow-md p-8", className)}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{description}</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          await onSubmit(values, helpers);
          if (nextStep && !isLastStep) {
            router.push(nextStep);
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={cn(field.width === "half" ? "" : "md:col-span-2", "space-y-2")}
                >
                  <Label htmlFor={field.id} className="text-text-gray-700 font-medium text-sm">
                    {field.label}
                    {field.required && <span className="text-red-600 ml-0.5">*</span>}
                  </Label>

                  {field.type === "select" ? (
                    <Field name={field.id}>
                      {({ field: formikField }: any) => (
                        <div className="relative">
                          <select
                            id={field.id}
                            {...formikField}
                            className={cn(
                              "w-full h-10 rounded-md border border-ui-border-muted px-3 py-2 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent appearance-none",
                              errors[field.id] && touched[field.id] && "border-red-500",
                            )}
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <ChevronDown size={16} className="text-ui-icon" />
                          </div>
                        </div>
                      )}
                    </Field>
                  ) : field.type === "checkbox" ? (
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <Field
                            type="checkbox"
                            id={`${field.id}.${option.value}`}
                            name={field.id}
                            value={option.value}
                            className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                          />
                          <label
                            htmlFor={`${field.id}.${option.value}`}
                            className="ml-2 text-sm text-gray-600"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Field name={field.id}>
                      {({ field: formikField }: any) => (
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          {...formikField}
                          className={cn(
                            "h-10 border-ui-border-muted focus:ring-brand-purple focus:border-transparent",
                            errors[field.id] && touched[field.id] && "border-red-500",
                          )}
                        />
                      )}
                    </Field>
                  )}

                  {errors[field.id] && touched[field.id] && (
                    <p className="mt-1 text-xs text-red-600">{errors[field.id] as string}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              {previousStep ? (
                <Link href={previousStep} className="mr-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-ui-border text-foreground font-medium text-base rounded-lg px-4 py-2"
                  >
                    Previous
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-purple hover:bg-brand-purple-hover text-white font-medium text-base rounded-lg px-4 py-2"
              >
                {isLastStep ? "Complete" : "Next"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

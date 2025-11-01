import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { QuoteFormData } from "@electron/types/quote.types";

export default function QuoteDiscountSection() {
  const { control, watch } = useFormContext<QuoteFormData>();
  const discountValue = watch("discount_percentage");
  const [oldState, setOldState] = useState(discountValue);
  const [sectionDisabled, setSectionDisabled] = useState(discountValue === 0);

  useEffect(() => {
    discountValue !== 0 && setSectionDisabled(false);
    discountValue !== 0 && setOldState(discountValue);
  }, [discountValue]);

  return (
    <Card>
      <Controller
        control={control}
        name="discount_percentage"
        render={({ field }) => (
          <>
            <CardHeader>
              <CardTitle className="flex items-center text-xl gap-2">
                Remise
                <Switch
                  checked={!sectionDisabled}
                  onCheckedChange={(e) => {
                    e ? field.onChange(oldState) : field.onChange(0);
                    setSectionDisabled(!e);
                  }}
                  variant="black"
                  size="default"
                />
              </CardTitle>
            </CardHeader>
            <CardContent
              className={cn(
                "space-y-4",
                sectionDisabled && "opacity-50 pointer-events-none"
              )}
            >
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="percentage"
                    name="discount-type"
                    value="percentage"
                    defaultChecked
                    className="accent-neutral-600 w-5 h-5 cursor-pointer"
                  />
                  <Label htmlFor="percentage">Pourcentage de réduction</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="5%"
                  disabled={sectionDisabled}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      field.onChange(value);
                      setOldState(value);
                    } else field.onChange(0);
                  }}
                  value={field.value || 0}
                  className="w-32"
                />
                <span>%</span>
              </div>
            </CardContent>
          </>
        )}
      />
    </Card>
  );
}

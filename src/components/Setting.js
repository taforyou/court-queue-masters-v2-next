'use client'
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from '../context/SettingsContext';
import { Switch } from "@/components/ui/switch";

const Setting = ({ onClose }) => {
  const { priceMode, americanMode, regularMode, groupMode, advancedHistory, updateSettings } = useSettings();
  const [localPriceMode, setLocalPriceMode] = useState(priceMode);
  const [localRegularMode, setLocalRegularMode] = useState(regularMode || { courtFee: '', shuttlecockFee: '' });
  const [localAmericanMode, setLocalAmericanMode] = useState(americanMode || { combinedFee: '' });
  const [localGroupMode, setLocalGroupMode] = useState(groupMode);
  const [localAdvancedHistory, setLocalAdvancedHistory] = useState(advancedHistory);

  useEffect(() => {
    setLocalPriceMode(priceMode);
    setLocalRegularMode(regularMode || { courtFee: '', shuttlecockFee: '' });
    setLocalAmericanMode(americanMode || { combinedFee: '' });
    setLocalGroupMode(groupMode);
    setLocalAdvancedHistory(advancedHistory);
  }, [priceMode, regularMode, americanMode, groupMode, advancedHistory]);

  const handleReset = () => {
    setLocalPriceMode('regular');
    setLocalRegularMode({ courtFee: '', shuttlecockFee: '' });
    setLocalAmericanMode({ combinedFee: '' });
    setLocalGroupMode(false);
    setLocalAdvancedHistory(false);
  };

  const handleSave = () => {
    updateSettings(localPriceMode, localAmericanMode, localRegularMode, localGroupMode, localAdvancedHistory);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title="Pricing Mode">
            <RadioGroup value={localPriceMode} onValueChange={setLocalPriceMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regular" id="regular" />
                <Label htmlFor="regular">Regular Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="american" id="american" />
                <Label htmlFor="american">American Share Mode</Label>
              </div>
            </RadioGroup>
          </Section>

          <Section title="Fee Settings">
            {localPriceMode === 'regular' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="courtFee">Court Fee</Label>
                  <Input
                    type="number"
                    id="courtFee"
                    value={localRegularMode.courtFee}
                    onChange={(e) => setLocalRegularMode({ ...localRegularMode, courtFee: e.target.value })}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shuttlecockFee">Shuttlecock Fee</Label>
                  <Input
                    type="number"
                    id="shuttlecockFee"
                    value={localRegularMode.shuttlecockFee}
                    onChange={(e) => setLocalRegularMode({ ...localRegularMode, shuttlecockFee: e.target.value })}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="combinedFee">Combined Fee (Court + Shuttlecock)</Label>
                <Input
                  type="number"
                  id="combinedFee"
                  value={localAmericanMode.combinedFee}
                  onChange={(e) => setLocalAmericanMode({ ...localAmericanMode, combinedFee: e.target.value })}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            )}
          </Section>

          <Section title="Additional Settings">
            <div className="flex items-center justify-between">
              <Label htmlFor="groupMode">Group Mode</Label>
              <Switch
                id="groupMode"
                checked={localGroupMode}
                onCheckedChange={setLocalGroupMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="advancedHistory">Advanced Player History</Label>
              <Switch
                id="advancedHistory"
                checked={localAdvancedHistory}
                onCheckedChange={setLocalAdvancedHistory}
              />
            </div>
          </Section>

          <Button 
            onClick={handleSave} 
            className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600"
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold">{title}</h3>
    {children}
  </div>
);

export default Setting;
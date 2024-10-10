'use client'
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from '../context/SettingsContext';

const Setting = ({ onClose }) => {
  const { priceMode, americanMode, regularMode, updateSettings } = useSettings();
  const [localPriceMode, setLocalPriceMode] = useState(priceMode);
  const [localRegularMode, setLocalRegularMode] = useState(regularMode || { courtFee: '', shuttlecockFee: '' });
  const [localAmericanMode, setLocalAmericanMode] = useState(americanMode || { combinedFee: '' });

  useEffect(() => {
    setLocalPriceMode(priceMode);
    setLocalRegularMode(regularMode || { courtFee: '', shuttlecockFee: '' });
    setLocalAmericanMode(americanMode || { combinedFee: '' });
  }, [priceMode, regularMode, americanMode]);

  const handleReset = () => {
    setLocalPriceMode('regular');
    setLocalRegularMode({ courtFee: '', shuttlecockFee: '' });
    setLocalAmericanMode({ combinedFee: '' });
  };

  const handleSave = () => {
    updateSettings(localPriceMode, localAmericanMode, localRegularMode);
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
        <CardContent className="space-y-4">
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

export default Setting;
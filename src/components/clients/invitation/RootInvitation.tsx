/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { Copy, Loader2, Plus, Trash2 } from 'lucide-react';

type TService = { name: string; price: number };
type TCatalog = { _id?: string; name: string; basePrice?: number };

export default function RootInvitation() {
    const { data, isLoading } = useGetServicesQuery({});
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [mode, setMode] = useState<'regular' | 'custom'>('regular');

    // Regular services
    const [selectedServices, setSelectedServices] = useState<TService[]>([]);

    // Custom services
    const [customServices, setCustomServices] = useState<TService[]>([
        { name: '', price: 0 },
    ]);

    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const services: TCatalog[] = (!isLoading && data?.data?.services) ?? [];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/invitation-form`
        : typeof window !== 'undefined'
        ? `${window.location.origin}/invitation-form`
        : '/invitation-form';

    const activeServices: TService[] = useMemo(() => {
        if (!isExistingUser) return []; // only pass services for existing user flow
        return mode === 'regular'
            ? selectedServices
            : customServices.filter((s) => s.name.trim());
    }, [isExistingUser, mode, selectedServices, customServices]);

    const canGenerate = useMemo(() => {
        if (!isExistingUser) return true; // can still generate a link without services for non-existing users
        if (activeServices.length === 0) return false;
        return activeServices.every(
            (s) => s.name.trim().length > 0 && Number(s.price) > 0
        );
    }, [isExistingUser, activeServices]);

    if (isLoading) {
        return (
            <p className="flex items-center justify-center h-[80vh] w-full">
                <Loader2 className="animate-spin" />
            </p>
        );
    }

    // ----- Regular service helpers -----
    const handleServiceToggle = (service: TCatalog) => {
        setSelectedServices((prev) => {
            const exists = prev.find((s) => s.name === service.name);
            if (exists) {
                return prev.filter((s) => s.name !== service.name);
            } else {
                const defaultPrice =
                    (service as any)?.price ?? service?.basePrice ?? 0;
                return [
                    ...prev,
                    { name: service.name, price: Number(defaultPrice) || 0 },
                ];
            }
        });
    };

    const handleRegularPriceChange = (name: string, price: string) => {
        setSelectedServices((prev) =>
            prev.map((s) =>
                s.name === name ? { ...s, price: Number(price) || 0 } : s
            )
        );
    };

    // ----- Custom service helpers -----
    const addCustomRow = () =>
        setCustomServices((prev) => [...prev, { name: '', price: 0 }]);
    const removeCustomRow = (idx: number) =>
        setCustomServices((prev) => prev.filter((_, i) => i !== idx));

    const changeCustomName = (idx: number, val: string) =>
        setCustomServices((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, name: val } : s))
        );

    const changeCustomPrice = (idx: number, val: string) =>
        setCustomServices((prev) =>
            prev.map((s, i) =>
                i === idx ? { ...s, price: Number(val) || 0 } : s
            )
        );

    // ----- Link & Clipboard -----
    const generateLink = () => {
        const query = new URLSearchParams();
        query.set('isExistingUser', String(isExistingUser));
        if (isExistingUser && activeServices.length > 0) {
            query.set('services', JSON.stringify(activeServices));
        }
        const link = `${baseUrl}?${query.toString()}`;
        setGeneratedLink(link);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        if (!generatedLink) return;
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="max-w-2xl mx-auto mt-10 p-4">
            <CardHeader>
                <CardTitle>Create Invitation Link</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Existing user toggle */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="existing-user"
                        checked={isExistingUser}
                        onCheckedChange={(checked) => {
                            const v = !!checked;
                            setIsExistingUser(v);
                            if (!v) {
                                // reset selections when switching off
                                setSelectedServices([]);
                                setCustomServices([{ name: '', price: 0 }]);
                            }
                        }}
                    />
                    <Label htmlFor="existing-user">Mark as Existing User</Label>
                </div>

                {/* Mode picker appears only for existing users */}
                {isExistingUser && (
                    <div className="space-y-3">
                        <Label className="block">Service Type</Label>
                        <RadioGroup
                            value={mode}
                            onValueChange={(v) =>
                                setMode(v as 'regular' | 'custom')
                            }
                            className="grid grid-cols-2 gap-3"
                        >
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                                <RadioGroupItem id="regular" value="regular" />
                                <Label
                                    htmlFor="regular"
                                    className="cursor-pointer"
                                >
                                    Regular service
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                                <RadioGroupItem id="custom" value="custom" />
                                <Label
                                    htmlFor="custom"
                                    className="cursor-pointer"
                                >
                                    Custom service
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                {/* Regular services (same as your original select section) */}
                {(!isExistingUser ||
                    (isExistingUser && mode === 'regular')) && (
                    <div>
                        <Label className="mb-2 block">Select Services</Label>
                        <div className="space-y-3 max-h-96 overflow-y-auto border p-3 rounded-md">
                            {services?.map((service: any) => {
                                const selected = selectedServices.find(
                                    (s) => s.name === service.name
                                );
                                return (
                                    <div
                                        key={service.name}
                                        className="space-y-2 border-b last:border-none pb-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={service.name}
                                                checked={!!selected}
                                                onCheckedChange={() =>
                                                    handleServiceToggle(service)
                                                }
                                            />
                                            <Label
                                                htmlFor={service.name}
                                                className="cursor-pointer"
                                            >
                                                {service.name}
                                            </Label>
                                        </div>
                                        {selected && (
                                            <div className="pl-6">
                                                <Label className="mb-1 block text-xs text-muted-foreground">
                                                    Price
                                                </Label>
                                                <Input
                                                    inputMode="numeric"
                                                    type="number"
                                                    min={0}
                                                    placeholder="Enter price"
                                                    value={selected.price || ''}
                                                    onChange={(e) =>
                                                        handleRegularPriceChange(
                                                            service.name,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {services?.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No services found.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Custom services builder */}
                {isExistingUser && mode === 'custom' && (
                    <div className="space-y-3">
                        <Label className="block">Custom Services</Label>

                        <div className="space-y-3">
                            {customServices.map((row, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-12 gap-3 items-end"
                                >
                                    <div className="col-span-6">
                                        <Label className="mb-1 block text-xs text-muted-foreground">
                                            Service name
                                        </Label>
                                        <Input
                                            placeholder="e.g., Retouching (50 images)"
                                            value={row.name}
                                            onChange={(e) =>
                                                changeCustomName(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <Label className="mb-1 block text-xs text-muted-foreground">
                                            Price
                                        </Label>
                                        <Input
                                            inputMode="numeric"
                                            type="number"
                                            min={0}
                                            placeholder="e.g., 5000"
                                            value={row.price || ''}
                                            onChange={(e) =>
                                                changeCustomPrice(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-1 flex">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-10 w-10 p-0 ml-auto"
                                            onClick={() => removeCustomRow(idx)}
                                            disabled={
                                                customServices.length === 1
                                            }
                                            title="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addCustomRow}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add another
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={generateLink} disabled={!canGenerate}>
                        Generate Link
                    </Button>
                    {!canGenerate && isExistingUser && (
                        <p className="text-sm text-destructive self-center">
                            Add at least one service with a valid price.
                        </p>
                    )}
                </div>

                {generatedLink && (
                    <div className="space-y-2">
                        <Label>Generated Invitation Link</Label>
                        <div className="flex gap-2">
                            <Input value={generatedLink} readOnly />
                            <Button variant="outline" onClick={copyToClipboard}>
                                {copied ? (
                                    'Copied!'
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

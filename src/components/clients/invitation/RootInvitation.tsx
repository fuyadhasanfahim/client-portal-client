/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { Copy, Loader2 } from 'lucide-react';

export default function RootInvitation() {
    const { data, isLoading } = useGetServicesQuery({});
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [selectedServices, setSelectedServices] = useState<
        { name: string; price: number }[]
    >([]);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const services = (!isLoading && data?.data?.services) ?? [];

    if (isLoading) {
        return (
            <p className="flex items-center justify-center h-[80vh] w-full">
                <Loader2 className="animate-spin" />
            </p>
        );
    }

    const handleServiceToggle = (service: { name: string }) => {
        setSelectedServices((prev) => {
            const exists = prev.find((s) => s.name === service.name);
            if (exists) {
                return prev.filter((s) => s.name !== service.name);
            } else {
                return [...prev, { ...service, price: 0 }];
            }
        });
    };

    const handlePriceChange = (id: string, price: string) => {
        setSelectedServices((prev) =>
            prev.map((s) =>
                s.name === id ? { ...s, price: Number(price) || 0 } : s
            )
        );
    };

    const generateLink = () => {
        const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL!}/invitation-form`;
        const query = new URLSearchParams();
        query.set('isExistingUser', String(isExistingUser));

        if (selectedServices.length > 0) {
            query.set('services', JSON.stringify(selectedServices));
        }

        setGeneratedLink(`${baseUrl}?${query.toString()}`);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        if (generatedLink) {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className="max-w-xl mx-auto mt-10 p-4">
            <CardHeader>
                <CardTitle>Create Invitation Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="existing-user"
                        checked={isExistingUser}
                        onCheckedChange={(checked) =>
                            setIsExistingUser(!!checked)
                        }
                    />
                    <Label htmlFor="existing-user">Mark as Existing User</Label>
                </div>

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
                                        <Label htmlFor={service.name}>
                                            {service.name}
                                        </Label>
                                    </div>
                                    {selected && (
                                        <div className="pl-6">
                                            <Input
                                                type="number"
                                                placeholder="Enter price"
                                                value={selected.price || ''}
                                                onChange={(e) =>
                                                    handlePriceChange(
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
                    </div>
                </div>

                <Button onClick={generateLink}>Generate Link</Button>

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

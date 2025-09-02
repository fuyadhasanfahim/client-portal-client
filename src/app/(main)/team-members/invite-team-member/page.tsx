'use client';

import React from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Send } from 'lucide-react';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function InviteTeamMemberPage() {
    const { user } = useLoggedInUser();
    console.log(user);

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Invite Team Member</CardTitle>
                <CardDescription>
                    Configure the invite url and send this with the email
                    address, and send this to you team member.
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
                <div className="space-y-6">
                    <div className="flex items-end gap-6">
                        <div className="w-full flex flex-col gap-2">
                            <Label htmlFor="team-member-email">
                                Team Members Email
                            </Label>
                            <Input
                                name="team-member-email"
                                type="email"
                                placeholder="Enter your team members email address..."
                            />
                        </div>
                        <Button variant={'secondary'}>
                            <RefreshCw />
                            Reset
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3>Customize</h3>
                            <div className="flex flex-col gap-3">
                                <Label className="">
                                    <Checkbox id="toggle-2" />
                                    <div className="grid gap-1.5 font-normal">
                                        <p className="text-sm leading-none font-medium">
                                            Can see price
                                        </p>
                                    </div>
                                </Label>
                                <Label className="">
                                    <Checkbox id="toggle-2" />
                                    <div className="grid gap-1.5 font-normal">
                                        <p className="text-sm leading-none font-medium">
                                            Can create order
                                        </p>
                                    </div>
                                </Label>
                                <Label className="">
                                    <Checkbox id="toggle-2" />
                                    <div className="grid gap-1.5 font-normal">
                                        <p className="text-sm leading-none font-medium">
                                            Can export multi invoice
                                        </p>
                                    </div>
                                </Label>
                                <Label className="">
                                    <Checkbox id="toggle-2" />
                                    <div className="grid gap-1.5 font-normal">
                                        <p className="text-sm leading-none font-medium">
                                            Can see all services
                                        </p>
                                    </div>
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <Separator />
            <CardFooter>
                <Button className="w-full">
                    <Send />
                    Send by Email
                </Button>
            </CardFooter>
        </Card>
    );
}

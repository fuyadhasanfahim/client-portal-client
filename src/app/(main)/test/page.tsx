import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Page() {
    return (
        <Card className="w-full max-w-3xl min-h-dvh border mx-auto py-0 overflow-hidden rounded-none">
            <div className="w-full h-6 relative">
                <div className="w-96 h-6 left-0 top-0 absolute bg-amber-500" />
                <div className="size-10 left-[116px] -top-[24.3px] rotate-45 absolute bg-amber-500 z-10" />
                <div className="w-full h-6 left-[136px] top-0 absolute bg-black" />
            </div>
            <CardHeader>
                <figure className="flex items-center justify-center">
                    <Image
                        src={
                            'https://res.cloudinary.com/dny7zfbg9/image/upload/v1751019279/tygwvniej4dtd9a7g8sx.svg'
                        }
                        alt="webbriks logo"
                        width={208}
                        height={28}
                        priority
                    />
                </figure>

                <div className="full inline-flex justify-between items-center mt-6 mx-10">
                    <div className="w-32 inline-flex flex-col justify-start items-start gap-1">
                        <h3 className="text-base font-medium">
                            Invoice To:{' '}
                            <span className="text-lg">Shough Shariar</span>
                        </h3>
                    </div>
                    <div className="inline-flex flex-col justify-start items-start gap-2">
                        <p className="justify-start font-normal">
                            Invoice No: 2345
                        </p>
                        <p className="justify-start font-normal">
                            Due Date: 12/05/2025
                        </p>
                    </div>
                </div>

                <div className="mx-10 mt-6 flex justify-between items-center">
                    <div className="inline-flex flex-col justify-start items-start gap-2">
                        <h3 className="text-lg font-medium">Client Info</h3>
                        <div className="flex flex-col justify-start items-start gap-1">
                            <h4 className="font-medium">
                                Satkhira Sadar, Satkhira
                            </h4>
                            <p className="text-xs font-normal">
                                +8801759-902358
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex flex-col justify-start items-start gap-2">
                        <h3 className="text-lg font-medium">Company Info</h3>
                        <div className="flex flex-col justify-start items-start gap-1">
                            <h4 className="font-medium">
                                Satkhira Sadar, Satkhira
                            </h4>
                            <p className="text-xs font-normal">
                                +8801759-902358
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}

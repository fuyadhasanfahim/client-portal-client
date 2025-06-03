import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IOrderService } from '@/types/order.interface';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import Link from 'next/link';

interface OrderDetailsServiceListProps {
    services: IOrderService[];
    images?: number;
    imageResizing?: 'Yes' | 'No';
    width?: number;
    height?: number;
    backgroundOption?: string;
    returnFileFormat?: string;
    instructions?: string;
    downloadLink?: string;
    supportingFileDownloadLink?: string;
}

export default function OrderDetailsServiceList({
    services,
    images,
    imageResizing,
    width,
    height,
    backgroundOption,
    returnFileFormat,
    instructions,
    downloadLink,
    supportingFileDownloadLink,
}: OrderDetailsServiceListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <IconBriefcaseFilled /> Services Ordered
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {services.map((service, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {service.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <ul className="list-disc list-inside">
                                <li>
                                    <strong>Images:</strong> {images} images
                                </li>
                                <li>
                                    <strong>Resize:</strong>{' '}
                                    {imageResizing === 'Yes'
                                        ? `${width}x${height}`
                                        : 'Not requested'}
                                </li>
                                <li>
                                    <strong>Background Option:</strong>{' '}
                                    {backgroundOption || 'N/A'}
                                </li>
                                <li>
                                    <strong>Return Format:</strong>{' '}
                                    {returnFileFormat || 'N/A'}
                                </li>
                                <li>Includes source file</li>
                                <li>Printable resolution file</li>
                                <li>Commercial use</li>
                            </ul>

                            {service.types && service.types.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-muted-foreground">
                                        Types:
                                    </h4>
                                    <ul className="list-disc list-inside ml-4">
                                        {service.types.map((type) => (
                                            <li key={type._id}>
                                                {type.name}
                                                {type.price &&
                                                    ` - $${type.price}`}
                                                {type.complexity && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        (Complexity:{' '}
                                                        {type.complexity.name} -
                                                        ${type.complexity.price}
                                                        )
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {service.colorCodes &&
                                service.colorCodes.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-muted-foreground mb-1">
                                            Color Codes:
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                            {service.colorCodes.join(', ')}
                                        </p>
                                    </div>
                                )}

                            {service.complexity && (
                                <div>
                                    <h4 className="font-medium text-muted-foreground mb-1">
                                        Selected Complexity:
                                    </h4>
                                    <p>
                                        {service.complexity.name} - $
                                        {service.complexity.price}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium text-muted-foreground mb-1">
                                    Download Link:
                                </h4>
                                <Link
                                    href={downloadLink || ''}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    View Download Link
                                </Link>
                            </div>

                            {supportingFileDownloadLink && (
                                <div>
                                    <h4 className="font-medium text-muted-foreground mb-1">
                                        Supporting Files:
                                    </h4>
                                    <a
                                        href={supportingFileDownloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        View Supporting File
                                    </a>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <div>
                                <CardTitle>Instruction:</CardTitle>
                                <CardDescription>
                                    {instructions}
                                </CardDescription>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}

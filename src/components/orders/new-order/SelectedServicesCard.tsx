import { Badge } from '@/components/ui/badge';
import { IDraftService } from '@/types/draft-order.interface';

export default function SelectedServicesCard({
    services,
}: {
    services: IDraftService[];
}) {
    return services.map((service: IDraftService, index: number) => (
        <div key={service._id} className="border-b last:border-none pb-3">
            <div className="flex items-center gap-2">
                <p className="capitalize font-medium">
                    {index + 1}. {service.name}
                </p>
                {service.complexity && (
                    <span className="text-sm text-muted-foreground">
                        → {service.complexity.name}
                    </span>
                )}
            </div>

            {(service.types ?? []).length > 0 && (
                <div className="pl-4 text-sm text-muted-foreground space-y-1 pt-1">
                    {service.types?.map((type) => (
                        <div key={type._id} className="flex gap-2">
                            <span>• {type.name}</span>
                            {type.complexity && (
                                <span>
                                    → {type.complexity.name} ($
                                    {type.complexity.price})
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(service.colorCodes ?? []).length > 0 && (
                <div className="pl-4 text-sm text-muted-foreground pt-1">
                    <p>
                        Color codes:{' '}
                        <Badge variant={'outline'} className='border-primary text-primary bg-green-50'>#{service.colorCodes?.join(', ')}</Badge>
                    </p>
                </div>
            )}
        </div>
    ));
}

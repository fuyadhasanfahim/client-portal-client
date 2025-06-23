import { IMessageUser } from '@/types/message.interface';

export default function getParticipant({
    participants,
    email,
}: {
    participants: IMessageUser[];
    email: string;
}) {
    const participant = participants.find(
        (participant) => participant.email !== email
    );

    return participant;
}

export const socketEvents = {
    joinRoom: (entity: string) => `${entity}:join-room`,
    leaveRoom: (entity: string) => `${entity}:leave-room`,

    entity: {
        created: (entity: string) => `${entity}:created`,
        updated: (entity: string) => `${entity}:updated`,
        statusUpdated: (entity: string) => `${entity}:status-updated`,
        delivered: (entity: string) => `${entity}:delivered`,
    },
};

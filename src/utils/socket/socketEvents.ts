export const socketEvents = {
    joinRoom: (entity: string) => `join-${entity}-room`,
    leaveRoom: (entity: string) => `leave-${entity}-room`,

    entity: {
        created: (entity: string) => `${entity}:created`,
        updated: (entity: string) => `${entity}:updated`,
        statusUpdated: (entity: string) => `${entity}:status-updated`,
        delivered: (entity: string) => `${entity}:delivered`,
    },
};

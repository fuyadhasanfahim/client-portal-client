export async function getDraftOrder(id: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/draft-orders/${id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    return res.json();
}

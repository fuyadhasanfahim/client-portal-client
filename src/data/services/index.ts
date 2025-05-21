const services = [
    {
        name: 'Path Creation',
        complexities: [
            {
                name: 'Clipping Path',
                price: 5,
            },
            {
                name: 'Multi-clipping Path',
                price: 5,
            },
        ],
    },
    {
        name: 'Background Removal',
        price: 4.5,
    },
    {
        name: 'Shadow Creation',
        complexities: [
            {
                name: 'Drop Shadow',
                price: 5,
            },
            {
                name: 'Existing Shadow',
                price: 5,
            },
        ],
    },
    {
        name: 'Photo Retouching',
        types: [
            {
                name: 'Dust, spot and scratch removal',
                complexities: [
                    {
                        name: 'Basic retouching',
                        price: 6,
                    },
                    {
                        name: 'Complex retouching',
                        price: 6,
                    },
                ],
            },
            {
                name: 'Wrinkle on clothing',
            },
            {
                name: 'Beauty airbrushing',
            },
            {
                name: 'Camera reflection removal',
                complexities: [
                    {
                        name: 'Basic retouching',
                        price: 6,
                    },
                    {
                        name: 'Complex retouching',
                        price: 6,
                    },
                ],
            },
        ],
    },
    {
        name: 'Ghost mannequin',
        price: 7,
    },
    {
        name: 'Color change',
        price: 5,
        inputs: true,
        instruction:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem officiis quis tenetur sapiente obcaecati similique quo eveniet labore iste eaque doloribus sequi dolorem, ex, aliquam architecto est itaque dignissimos voluptatum.',
    },
    {
        name: 'Vector conversion',
        complexities: [
            {
                name: 'Logo',
                price: 7,
            },
            {
                name: 'Logo',
                price: 7,
            },
            {
                name: 'Logo',
                price: 7,
            },
        ],
    },
];

export default services;

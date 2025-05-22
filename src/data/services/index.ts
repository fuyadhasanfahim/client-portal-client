const services = [
    {
        _id: '1',
        name: 'Path Creation',
        complexities: [
            {
                _id: '1',
                name: 'Clipping Path',
                price: 5,
            },
            {
                _id: '2',
                name: 'Multi-clipping Path',
                price: 5,
            },
        ],
    },
    {
        _id: '2',
        name: 'Background Removal',
        price: 4.5,
    },
    {
        _id: '3',
        name: 'Shadow Creation',
        complexities: [
            {
                _id: '1',
                name: 'Drop Shadow',
                price: 5,
            },
            {
                _id: '2',
                name: 'Existing Shadow',
                price: 5,
            },
        ],
    },
    {
        _id: '4',
        name: 'Photo Retouching',
        types: [
            {
                _id: '1',
                name: 'Dust, spot and scratch removal',
                complexities: [
                    {
                        _id: '1',
                        name: 'Basic retouching',
                        price: 6,
                    },
                    {
                        _id: '2',
                        name: 'Complex retouching',
                        price: 6,
                    },
                ],
            },
            {
                _id: '2',
                name: 'Wrinkle on clothing',
                price: 6,
            },
            {
                _id: '3',
                name: 'Beauty airbrushing',
                price: 6,
            },
            {
                _id: '4',
                name: 'Camera reflection removal',
                complexities: [
                    {
                        _id: '1',
                        name: 'Basic retouching',
                        price: 6,
                    },
                    {
                        _id: '2',
                        name: 'Complex retouching',
                        price: 6,
                    },
                ],
            },
        ],
    },
    {
        _id: '5',
        name: 'Ghost mannequin',
        price: 7,
    },
    {
        _id: '6',
        name: 'Color change',
        price: 5,
        inputs: true,
        instruction:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem officiis quis tenetur sapiente obcaecati similique quo eveniet labore iste eaque doloribus sequi dolorem, ex, aliquam architecto est itaque dignissimos voluptatum.',
    },
    {
        _id: '7',
        name: 'Vector conversion',
        complexities: [
            {
                _id: '1',
                name: 'Logo',
                price: 7,
            },
            {
                _id: '2',
                name: 'Line art',
                price: 7,
            },
        ],
    },
];

export default services;

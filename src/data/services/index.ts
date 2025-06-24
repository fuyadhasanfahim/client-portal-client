const services = [
    {
        _id: 'service-1',
        name: 'Path Creation',
        complexities: [
            {
                _id: 'complexity-1-1',
                name: 'Clipping Path',
                price: 0.5,
            },
            {
                _id: 'complexity-1-2',
                name: 'Multi-clipping Path',
                price: 0.5,
            },
        ],
        options: true,
        disabledOptions: ['Background Removal', 'Vector conversion'],
    },
    {
        _id: 'service-2',
        name: 'Background Removal',
        price: 0.5,
    },
    {
        _id: 'service-3',
        name: 'Shadow',
        complexities: [
            {
                _id: 'complexity-3-1',
                name: 'Drop Shadow',
                price: 0.25,
            },
            {
                _id: 'complexity-3-2',
                name: 'Existing Shadow',
                price: 0.29,
            },
            {
                _id: 'complexity-3-3',
                name: 'Floating shadow',
                price: 0.5,
            },
            {
                _id: 'complexity-3-4',
                name: 'Natural shadow',
                price: 0.39,
            },
            {
                _id: 'complexity-3-5',
                name: 'Reflection shadow',
                price: 0.5,
            },
        ],
        disabledOptions: ['Vector conversion'],
    },
    {
        _id: 'service-4',
        name: 'Photo Retouching',
        types: [
            {
                _id: 'type-4-1',
                name: 'Dust, spot and scratch removal',
                complexities: [
                    {
                        _id: 'complexity-4-1-1',
                        name: 'Basic retouching',
                        price: 1,
                    },
                    {
                        _id: 'complexity-4-1-2',
                        name: 'Advance retouching',
                        price: 4,
                    },
                ],
            },
            {
                _id: 'type-4-2',
                name: 'Wrinkle on clothing',
                price: 2,
            },
            {
                _id: 'type-4-3',
                name: 'Beauty airbrushing',
                price: 5,
            },
            {
                _id: 'type-4-4',
                name: 'Camera reflection removal',
                complexities: [
                    {
                        _id: 'complexity-4-4-1',
                        name: 'Basic retouching',
                        price: 1,
                    },
                    {
                        _id: 'complexity-4-4-2',
                        name: 'Advance retouching',
                        price: 3,
                    },
                ],
            },
        ],
        disabledOptions: ['Vector conversion'],
    },
    {
        _id: 'service-5',
        name: 'Ghost mannequin',
        price: 2,
        disabledOptions: ['Vector conversion'],
    },
    {
        _id: 'service-6',
        name: 'Color change',
        price: 1,
        inputs: true,
        instruction:
            "Transform your product's appearance with our professional color change service. Perfect for showcasing different color variants without additional photoshoots. Whether you need subtle hue adjustments or complete color transformations, our experts will ensure natural-looking results that maintain texture and detail. Ideal for e-commerce, marketing materials, and product catalogs.",
        disabledOptions: ['Vector conversion'],
    },
    {
        _id: 'service-7',
        name: 'Vector conversion',
        complexities: [
            {
                _id: 'complexity-7-1',
                name: 'Logo',
                price: 10,
            },
            {
                _id: 'complexity-7-2',
                name: 'Artwork',
                price: 20,
            },
            {
                _id: 'complexity-7-3',
                name: 'Line drawing',
                price: 15,
            },
            {
                _id: 'complexity-7-4',
                name: 'Illustration',
                price: 50,
            },
        ],
        disabledOptions: [
            'Path creation',
            'Background removal',
            'Shadow',
            'Photo retouching',
            'Ghost mannequin',
            'Color change',
        ],
    },
];

export default services;

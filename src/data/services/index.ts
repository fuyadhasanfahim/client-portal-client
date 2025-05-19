const services = [
    {
        name: 'Path Creation',
        value: 'path-creation',
        radios: [
            {
                name: 'Clipping Path',
                value: 'clipping-path',
            },
            {
                name: 'Multi-Clipping Path',
                value: 'multi-clipping-path',
            },
        ],
    },
    {
        name: 'Background Removal',
        value: 'background-removal',
    },
    {
        name: 'Shadow Creation',
        value: 'shadow-creation',
        radios: [
            {
                name: 'Drop Shadow',
                value: 'drop-shadow',
            },
            {
                name: 'Existing Shadow',
                value: 'existing-shadow',
            },
            {
                name: 'Floating shadow',
                value: 'floating-shadow',
            },
            {
                name: 'Natural Shadow',
                value: 'natural-shadow',
            },
            {
                name: 'Reflection Shadow',
                value: 'reflection-shadow',
            },
        ],
    },
    {
        name: 'Photo Retouching',
        value: 'photo-retouching',
        checkboxes: [
            {
                name: 'Dust, spot and scratch removal',
                value: 'dust-spot-scratch-removal',
                radios: [
                    {
                        name: 'Basic retouching',
                        value: 'basic-retouching',
                    },
                    {
                        name: 'Advanced retouching',
                        value: 'advanced-retouching',
                    },
                ],
            },
            {
                name: 'Wrinkle on clothing',
                value: 'wrinkle-on-clothing',
            },
            {
                name: 'Beauty airbrushing',
                value: 'beauty-airbrushing',
            },
            {
                name: 'Camera reflection removal',
                value: 'camera-reflection-removal',
                radios: [
                    {
                        name: 'Basic retouching',
                        value: 'basic-retouching',
                    },
                    {
                        name: 'Advance retouching',
                        value: 'advance-retouching',
                    },
                ],
            },
        ],
    },
    {
        name: 'Ghost mannequin',
        value: 'ghost-mannequin',
    },
    {
        name: 'Color change',
        value: 'color-change',
        instruction:
            "For each color variant, provide a color code or approximate name. If you have swatch files or color reference images, simply note them here and upload under 'Supporting files' in the 'Preferences' step later.",
        inputs: true,
    },
    {
        name: 'Vector conversion',
        value: 'vector-conversion',
        radios: [
            {
                name: 'Logo',
                value: 'logo',
            },
            {
                name: 'Artwork',
                value: 'artwork',
            },
            {
                name: 'Line drawing',
                value: 'line-drawing',
            },
            {
                name: 'Illustration',
                value: 'illustration',
            },
        ],
    },
];

export default services;

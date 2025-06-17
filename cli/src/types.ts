export interface EmoteSetEmote {
    alias: string;
    flags: {
        zeroWidth: boolean;
        __typename: string;
    };
    emote: Emote;
    __typename: string;
}

export interface Emote {
    id: string;
    defaultName: string;
    owner: {
        mainConnection: {
            platformDisplayName: string;
            __typename: string;
        };
        style: {
            activePaint: null | PaintData;
            __typename: string;
        };
        highestRoleColor: null | {
            hex: string;
            __typename: string;
        };
        __typename: string;
    };
    flags: {
        defaultZeroWidth: boolean;
        private: boolean;
        publicListed: boolean;
        __typename: string;
    };
    images: EmoteImage[];
    ranking: null | any; // Can be further specified if ranking structure is known
    __typename: string;
}

export interface EmoteImage {
    url: string;
    mime: string;
    size: number;
    scale: number;
    width: number;
    frameCount: number;
    __typename: string;
}

export interface PaintData {
    id: string;
    name: string;
    data: {
        layers: PaintLayer[];
        shadows: Shadow[];
        __typename: string;
    };
    __typename: string;
}

export interface PaintLayer {
    id: string;
    ty: PaintLayerType;
    opacity: number;
    __typename: string;
}

type PaintLayerType = 
    | PaintLayerTypeSingleColor
    | PaintLayerTypeLinearGradient
    | PaintLayerTypeRadialGradient
    | PaintLayerTypeImage;

export interface PaintLayerTypeSingleColor {
    __typename: 'PaintLayerTypeSingleColor';
    color: {
        hex: string;
        __typename: string;
    };
}

export interface PaintLayerTypeLinearGradient {
    __typename: 'PaintLayerTypeLinearGradient';
    angle: number;
    repeating: boolean;
    stops: GradientStop[];
}

export interface PaintLayerTypeRadialGradient {
    __typename: 'PaintLayerTypeRadialGradient';
    repeating: boolean;
    stops: GradientStop[];
    shape: string;
}

export interface PaintLayerTypeImage {
    __typename: 'PaintLayerTypeImage';
    images: EmoteImage[];
}

export interface GradientStop {
    at: number;
    color: {
        hex: string;
        __typename: string;
    };
    __typename: string;
}

export interface Shadow {
    color: {
        hex: string;
        __typename: string;
    };
    offsetX: number;
    offsetY: number;
    blur: number;
    __typename: string;
}

export interface EmoteResponse {
    data: {
        emoteSets: {
            emoteSet: {
                emotes: {
                    items: EmoteSetEmote[];
                    totalCount: number;
                    pageCount: number;
                    __typename: string;
                };
                __typename: string;
            };
            __typename: string;
        };
    };
}
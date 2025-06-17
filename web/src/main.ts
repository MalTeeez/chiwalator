//#region constants
const state = {
    wordMap: new Map() as Map<string, string>,
    isLoading: false as boolean,
    error: null as string | null
};

const elements = {
    input: document.getElementById('inputText') as HTMLTextAreaElement,
    translateBtn: document.getElementById('translateBtn') as HTMLButtonElement,
    output: document.getElementById('output') as HTMLDivElement,
    loading: document.getElementById('loading') as HTMLDivElement,
    error: document.getElementById('error') as HTMLDivElement
};

//#region main stuffs
async function loadWordMap() {
    try {
        setLoading(true);
        const response = await fetch('./word_map.json');
        const data = await response.json();
        state.wordMap = map_key_to_actual(new Map(Object.entries(data)));
        setLoading(false);
    } catch (error) {
        setError('Failed to load word map');
        setLoading(false);
    }
}

function handleTranslate() {
    const input = elements.input.value.trim();
    if (!input) {
        setError('Please enter some text to translate');
        return;
    }

    const words = input.split(' ');
    const translated = translate(words);
    elements.output.textContent = translated.join(' ');
    setError(null);
}

function setLoading(loading: boolean) {
    state.isLoading = loading;
    elements.loading.classList.toggle('hidden', !loading);
    elements.translateBtn.disabled = loading;
}

function setError(error: string | null) {
    state.error = error;
    elements.error.textContent = error || '';
    elements.error.classList.toggle('hidden', !error);
}

function translate(words: string[]) {
    let sentence: string[] = [];

    for (const word of words) {
        sentence.push(state.wordMap.get(word) || word)
    }

    return sentence;
}

function map_key_to_actual(map: Map<string, { [key: string]: string }>): Map<string, string> {
    const actual_map: Map<string, string> = new Map();
    for (const [key, val] of map.entries()) {
        if (val.actual && val.actual.length > 0) {
            actual_map.set(val.actual, key)
        }
    }

    return actual_map;
}


//#region entrypoint
elements.translateBtn.addEventListener('click', () => handleTranslate());
elements.input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === "Enter") handleTranslate()
});
loadWordMap();

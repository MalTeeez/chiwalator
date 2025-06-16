import type { EmoteResponse } from './types';
import { print_pretty, read_from_file, save_map_to_file } from './utils';

const WORD_MAP_FILE = './word_map.json';

async function refresh() {
    const file_contents = await read_from_file(WORD_MAP_FILE);
    const map_pre = new Map(Object.entries(file_contents));

    if (map_pre as Map<string, { [key: string]: string }> instanceof Map) {
        const map: Map<string, { [key: string]: string }> = map_pre as Map<string, { [key: string]: string }>
        
        for (let page = 0; page < 1; page++) {
            const response = await get_gql_for_page(page, 500);
            if (response.ok && response.body != null) {
                const unsure_data = (await response.json()) as EmoteResponse | undefined;
                const data = unsure_data?.data?.emoteSets?.emoteSet?.emotes?.items;

                if (data != undefined && data.length > 0) {
                    for (const emote of data) {
                        if (emote.emote.owner != null) {
                            const entry = map.get(emote.emote.defaultName)
                            if (entry !== undefined && typeof entry.actual === "string" && entry.actual.length < 1) {
                                map.set(emote.emote.defaultName, {
                                    author: emote.emote.owner.mainConnection.platformDisplayName,
                                    actual: "",
                                });
                            }
                        }
                    }
                }
            }
        }
        print_pretty(['Alias', Array.from(map.keys())], ['Default', Array.from(map.values().map(val => val.author || ""))]);
        await save_map_to_file(WORD_MAP_FILE, map);
    }
}

async function get_gql_for_page(page: number, perPage: number = 72): Promise<Response> {
    return await fetch('https://api.7tv.app/v4/gql', {
        method: 'POST',
        body: JSON.stringify({
            operationName: 'EmotesInSet',
            query: `query EmotesInSet($id: Id!, $query: String, $page: Int!, $perPage: Int!, $isDefaultSetSet: Boolean!, $defaultSetId: Id!) {
        emoteSets {
          emoteSet(id: $id) {
            emotes(query: $query, page: $page, perPage: $perPage) {
              __typename
              items {
                alias
                flags {
                  zeroWidth
                  __typename
                }
                emote {
                  id
                  defaultName
                  owner {
                    mainConnection {
                      platformDisplayName
                      __typename
                    }
                    style {
                      activePaint {
                        id
                        name
                        data {
                          layers {
                            id
                            ty {
                              __typename
                              ... on PaintLayerTypeSingleColor {
                                color {
                                  hex
                                  __typename
                                }
                                __typename
                              }
                              ... on PaintLayerTypeLinearGradient {
                                angle
                                repeating
                                stops {
                                  at
                                  color {
                                    hex
                                    __typename
                                  }
                                  __typename
                                }
                                __typename
                              }
                              ... on PaintLayerTypeRadialGradient {
                                repeating
                                stops {
                                  at
                                  color {
                                    hex
                                    __typename
                                  }
                                  __typename
                                }
                                shape
                                __typename
                              }
                              ... on PaintLayerTypeImage {
                                images {
                                  url
                                  mime
                                  size
                                  scale
                                  width
                                  height
                                  frameCount
                                  __typename
                                }
                                __typename
                              }
                            }
                            opacity
                            __typename
                          }
                          shadows {
                            color {
                              hex
                              __typename
                            }
                            offsetX
                            offsetY
                            blur
                            __typename
                          }
                          __typename
                        }
                        __typename
                      }
                      __typename
                    }
                    highestRoleColor {
                      hex
                      __typename
                    }
                    __typename
                  }
                  flags {
                    defaultZeroWidth
                    private
                    publicListed
                    __typename
                  }
                  images {
                    url
                    mime
                    size
                    scale
                    width
                    frameCount
                    __typename
                  }
                  ranking(ranking: TRENDING_WEEKLY)
                  inEmoteSets(emoteSetIds: [$defaultSetId]) @include(if: $isDefaultSetSet) {
                    emoteSetId
                    emote {
                      id
                      alias
                      __typename
                    }
                    __typename
                  }
                  __typename
                }
                __typename
              }
              totalCount
              pageCount
            }
            __typename
          }
          __typename
        }
      }`,
            variables: { defaultSetId: '', id: '01HK8VR6PR00055RWFJ3SKA26V', isDefaultSetSet: false, page, perPage },
        }),
        headers: { 'Content-Type': 'application/json' },
    });
}

async function translate(words: string[]) {
    const file_contents = await read_from_file(WORD_MAP_FILE);
    const map_pre = new Map(Object.entries(file_contents));

    let sentence: string[] = [];

    if (map_pre as Map<string, { [key: string]: string }> instanceof Map) {
        const map: Map<string, string> = map_key_to_actual(map_pre as Map<string, { [key: string]: string }>)

        // print_pretty(['Alias', Array.from(map.keys())], ['Default', Array.from(map.values())]);
        for (const word of words) {
            sentence.push(map.get(word) || word)
        }
    }

    console.log(sentence.join(" "));
}

function map_key_to_actual(map: Map<string, { [key: string]: string }>): Map<string, string> {
    const actual_map: Map<string, string> = new Map();
    for (const [key, val] of map) {
        if (val.actual && val.actual.length > 0) {
            actual_map.set(val.actual, key)
        }
    }

    return actual_map;
}


//#region Entrypoint
async function main() {
    const args = process.argv.slice(2);
    const mode = args[0]?.toLowerCase();

    try {
        if (mode === 'refresh') {
            await refresh();
            console.log('refreshed word map!');
        } else if (mode === 'translate') {
            await translate(args.slice(1));
        } else {
            console.log('Usage: bun run index.ts [mode]');
            console.log('Modes:');
            console.log('  refresh      - Refresh word map');
            console.log('  translate    - Words you want to translate');
        }
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Forward to main function with arguments
if (import.meta.url === import.meta.resolve('file://' + process.argv[1])) {
    await main().catch(console.error);
}

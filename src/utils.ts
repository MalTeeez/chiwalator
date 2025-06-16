export type JsonObject = { [key: string]: JsonObject | Array<JsonObject> | string | undefined };

/**
 * Save a javascript map object to a file
 * @param {string} file_path Path of the file to save in
 * @param {*} data Data to save. Must be parseable by JSON.stringify
 */
export async function save_map_to_file(file_path: string, data: Map<string, { [key: string]: any }>) {
    try {
        // Sort and convert to object
        const map_obj: { [key: string]: any } = {};
        data.keys()
            .toArray()
            .sort((a, b) => b.length - a.length)
            .forEach((key) => {
                map_obj[key] = data.get(key);
            });

        await Bun.write(file_path, JSON.stringify(map_obj));
        await run_prettier(file_path);
    } catch (err) {
        console.error(err);
    }
}

/**
 * Read a javascript object from a file and parse it with json
 * @param {string} file_path Path of the file to read
 */
export async function read_from_file(file_path: string): Promise<JsonObject> {
    const file = Bun.file(file_path);
    if (await file.exists()) {
        try {
            return JSON.parse(await file.text());
        } catch (err) {
            console.error(err);
            return {};
        }
    } else {
        console.error('File ', file, ' does not exist.');
        return {};
    }
}

export async function run_prettier(file_path: string) {
    try {
        const proc = Bun.spawn(['bunx', 'prettier', '--write', file_path]);
        const output = await new Response(proc.stdout).text();
        const error = await new Response(proc.stderr).text();

        if (error) {
            console.error('Prettier error:', error);
        }
        return output;
    } catch (err) {
        console.error('Failed to run prettier:', err);
    }
}

/**
 * Prints the values in an array in a column-like fashion.
 * Accepts arrays as a tuple, of type [header text, array values].
 */
export function print_pretty(...args: [string, string[]][]) {
    let lengths: number[] = Array(args.length).fill(0);
    const lines: Array<string[]> = [];
    let i = 0;
    let max_size = 0;

    // Calculate maximum lengths per col
    for (const [header, array] of args) {
        const full_arr = [...[header], ...array]
        for (const text of full_arr) {
            lengths[i] = Math.max(lengths[i] || 0, text.length);
        }
        lines.push(full_arr);
        max_size = Math.max(max_size, array.length);
        i++;
    }
    
    // Header & Footer rows
    i = 0;
    let output = "┌─";
    let footer = "└─";
    for (const arr of lines) {
        const header = arr[0] || "";
        // Header is left-aligned, and uses the first entry in each column
        output += header + "─".repeat((lengths[i] || header.length) - header.length);
        // Footer is right-aligned and contains the number of items in its respective column
        const footer_text = "(" + (arr.length - 1) + " item" + ((arr.length - 1) == 1 ? "" : "s") + ")";
        // Footer tooltip might be longer than current max length
        lengths[i] = Math.max(lengths[i] || 0, footer_text.length)
        footer += "─".repeat((lengths[i] || footer_text.length) - footer_text.length) + footer_text

        if (i >= lengths.length - 1) {
            output += "─┐\n";
            footer += "─┘\n";
        } else {
            output += "─┬─";
            footer += "─┴─";
        }
        i++;
    }
    
    // Data rows
    for (i = 1; i <= max_size; i++) {
        let row = "| ";
        let col_num = 0;
        for (const arr of lines) {
            const text = arr[i] || "";
            // Align text left, numbers right
            if (Number.isNaN(+text)) {
                row += text + " ".repeat((lengths[col_num] || text.length) - text.length);
            } else {
                row += " ".repeat((lengths[col_num] || text.length) - text.length) + text;
            }
            
            if (col_num < lengths.length - 1) row += " | ";
            col_num++;
        }
        output += row + " |\n"
    }

    output += footer;
    console.log(output)
}
export interface ProgressiveJSONResult {
  [key: string]: unknown;
}

export class ProgressiveJSON {
  private result: ProgressiveJSONResult | unknown[] | null = null;

  private extractChunkNumber(data: string): number {
    const pattern = /\$(\d+)/;
    const match = data.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    } else {
      throw new Error(`Couldn't find chunk number in ${data}`);
    }
  }

  private extractJsonData(data: string): string {
    const splitted = data.split("*/");
    if (splitted.length !== 2) {
      throw new Error("Something wrong is passed data");
    } else {
      return splitted[1].trim();
    }
  }

  private parseStrChunked(data: string, chunkNumber?: number): void {
    const chunkedData = JSON.parse(data);
    if (typeof chunkedData === 'object' && chunkedData !== null && !Array.isArray(chunkedData)) {
      this.parseDict(chunkedData as ProgressiveJSONResult, chunkNumber);
    } else if (Array.isArray(chunkedData)) {
      this.parseList(chunkedData, chunkNumber);
    }
  }

  private parseList(data: unknown[], chunkNumber?: number): void {
    if (!chunkNumber) {
      for (const item of data) {
        if (typeof item === 'string' && item.startsWith("$")) {
          this.result = data;
        } else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          for (const val of Object.values(item)) {
            if (typeof val === 'string' && val.startsWith("$")) {
              this.result = data;
            }
          }
        }
      }
    } else if (chunkNumber && this.result) {
      if (typeof this.result === 'object' && this.result !== null && !Array.isArray(this.result)) {
        this.replacePlaceholders(this.result as ProgressiveJSONResult, data, chunkNumber);
      } else if (Array.isArray(this.result)) {
        this.replacePlaceholdersInList(this.result, data, chunkNumber);
      }
    }
  }

  parseStr(data: string): string | void {
    if (data.startsWith("/*")) {
      const chunkNumber = this.extractChunkNumber(data);
      const chunkData = this.extractJsonData(data);
      if (typeof chunkNumber === 'number') {
        this.parseStrChunked(chunkData, chunkNumber);
      }
    } else {
      const parsedData = JSON.parse(data);
      if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
        return JSON.stringify(this.parseDict(parsedData as ProgressiveJSONResult));
      } else if (Array.isArray(parsedData)) {
        return JSON.stringify(this.parseList(parsedData));
      }
    }
  }

  private parseDict(data: ProgressiveJSONResult, chunkNumber?: number): void {
    if (!chunkNumber) {
      for (const [_key, val] of Object.entries(data)) {
        if (typeof val === 'string' && val.startsWith("$")) {
          this.result = data;
        }
      }
    } else if (chunkNumber && this.result) {
      if (typeof this.result === 'object' && this.result !== null && !Array.isArray(this.result)) {
        this.replacePlaceholders(this.result as ProgressiveJSONResult, data, chunkNumber);
      }
    }
  }

  private replacePlaceholders(targetDict: ProgressiveJSONResult, chunkData: unknown, chunkNumber: number): void {
    for (const [key, val] of Object.entries(targetDict)) {
      if (typeof val === 'string' && val.startsWith(`$${chunkNumber}`)) {
        targetDict[key] = chunkData;
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        this.replacePlaceholders(val as ProgressiveJSONResult, chunkData, chunkNumber);
      } else if (Array.isArray(val)) {
        this.replacePlaceholdersInList(val, chunkData, chunkNumber);
      }
    }
  }

  private replacePlaceholdersInList(targetList: unknown[], chunkData: unknown, chunkNumber: number): void {
    for (let i = 0; i < targetList.length; i++) {
      const item = targetList[i];
      if (typeof item === 'string' && item.startsWith(`$${chunkNumber}`)) {
        targetList[i] = chunkData;
      } else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        this.replacePlaceholders(item as ProgressiveJSONResult, chunkData, chunkNumber);
      } else if (Array.isArray(item)) {
        this.replacePlaceholdersInList(item, chunkData, chunkNumber);
      }
    }
  }

  getResult(): ProgressiveJSONResult | unknown[] | null {
    return this.result;
  }
}
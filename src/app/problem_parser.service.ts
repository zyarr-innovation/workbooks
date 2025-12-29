import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Example {
  id: string;
  description: string;
  lines: string[];
}

export interface Section {
  title: string;
  level: number;
  examples: Example[];
}

@Injectable({
  providedIn: 'root'
})
export class ProblemParserService {
  constructor(private http: HttpClient) {}
  // This function reads the file and pipes it through the parser
  getWorkbookData(filePath: string): Observable<Section[]> {
    return this.http.get(filePath, { responseType: 'text' }).pipe(
      map(rawText => this.parseText(rawText))
    );
  }
  
  parseText(rawText: string): Section[] {
    const sections: Section[] = [];
    const lines = rawText.split('\n');

    let currentSection: Section | null = null;
    let currentExample: Example | null = null;

    for (let line of lines) {
      line = line.trim();

      // 1. Skip separators or empty lines
      if (!line || line.startsWith('____')) continue;

      // 2. Identify Headings (e.g., ## Header)
      if (line.startsWith('#')) {
        const match = line.match(/^(#+)\s*(.*)/);
        if (match) {
          currentSection = {
            title: match[2],
            level: match[1].length,
            examples: []
          };
          sections.push(currentSection);
          currentExample = null; // Reset example context for new section
        }
      } 
      
      // 3. Identify Examples (e.g., Ex. 1: Description)
      else if (line.startsWith('Ex') || line.startsWith('ex')) {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          currentExample = {
            id: line.substring(0, separatorIndex).trim(),
            description: line.substring(separatorIndex + 1).trim(),
            lines: []
          };
          if (currentSection) {
            currentSection.examples.push(currentExample);
          }
        }
      } 
      
      // 4. Everything else is a sub-line of an example
      else if (currentExample) {
        currentExample.lines.push(line);
      }
    }

    return sections;
  }
}
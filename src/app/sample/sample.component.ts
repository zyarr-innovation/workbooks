import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { Section, Example } from '../problem_parser.service';

interface Blank {
  id: number;
  correctValue: string;
  userValue: string;
  status: 'empty' | 'incorrect' | 'correct';
}

interface LinePart {
  type: 'text' | 'input';
  value?: string;       // for type === 'text'
  inputId?: number;     // for type === 'input'
  charLen?: number;     // for type === 'input': inner.length + 4 (for the 2 underscores on each side)
}

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatExpansionModule,
  ],
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.css']
})
export class SampleComponent implements OnChanges {
  @Input() sections: Section[] = [];

  blanks: Blank[] = [];
  processedSections: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sections'] && this.sections) {
      // TEMP DEBUG
      console.log('RAW lines:', JSON.stringify(this.sections[0]?.examples[0]?.lines));
      this.processAllSections();
    }
  }

  processAllSections() {
    this.blanks = [];
    let blankCounter = 0;

    this.processedSections = this.sections.map((section: Section) => ({
      ...section,
      examples: section.examples.map((example: Example) => ({
        ...example,
        processedLines: example.lines.flatMap((line: string) =>
          line.split('\n').map((singleLine: string) => {
            const parts: LinePart[] = [];

            // If line is empty or only whitespace, push a non-breaking space
            // so the div has content and does not collapse
            if (singleLine.trim() === '') {
              parts.push({ type: 'text', value: '\u00A0' });
              return parts;
            }

            const segments = singleLine.split(/(__[^_]+__)/g);
            segments.forEach((segment: string) => {
              if (segment.startsWith('__') && segment.endsWith('__') && segment.length > 4) {
                const inner = segment.slice(2, -2);
                const charLen = inner.length + 4;
                const id = blankCounter++;
                this.blanks.push({ id, correctValue: inner.trim(), userValue: '', status: 'empty' });
                parts.push({ type: 'input', inputId: id, charLen });
              } else {
                parts.push({ type: 'text', value: segment });
              }
            });

            return parts;
          })
        )
      }))
    }));
  }

  onKeyup(id: number) {
    const blank = this.blanks[id];
    if (!blank) return;
    const input = blank.userValue.trim();
    const target = blank.correctValue;
    if (input === '') blank.status = 'empty';
    else if (input === target) blank.status = 'correct';
    else blank.status = 'incorrect';
  }
}
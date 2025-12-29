// FIX: Changed from @angular/common to @angular/core
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

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule, MatCardModule, MatExpansionModule,],
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.css']
})
export class SampleComponent implements OnChanges {
  @Input() sections: Section[] = [];
  blanks: Blank[] = [];
  processedSections: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sections'] && this.sections) {
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
        processedLines: example.lines.map((line: string) => {
          const parts: any[] = [];
          const segments = line.split(/__(.*?)__/g);
          
          segments.forEach((segment: string, index: number) => {
            if (index % 2 === 0) {
              parts.push({ type: 'text', value: segment });
            } else {
              const id = blankCounter++;
              this.blanks.push({
                id,
                correctValue: segment.trim(),
                userValue: '',
                status: 'empty'
              });
              parts.push({ type: 'input', inputId: id });
            }
          });
          return parts;
        })
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
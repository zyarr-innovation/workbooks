import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { SampleComponent } from './sample/sample.component';
import { ProblemParserService, Section } from './problem_parser.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SampleComponent], // This will work now
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  workbookSections: Section[] = [];

  constructor(private parserService: ProblemParserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 3. Listen for changes in the address line parameters
    this.route.queryParams.subscribe(params => {
      const fileId = params['file']; // Checks for ?file=X
      
      // 4. Determine which file to load
      // If ?file=2 is in URL, use answers2.txt, otherwise default to answers.txt
      let fileName = 'guided_workbook_answers.txt';
      
      if (fileId) {
        fileName = `guided_workbook_answers${fileId}.txt`;
      }

      this.loadWorkbook(fileName);
    });
  }

  private loadWorkbook(fileName: string) {
    this.parserService.getWorkbookData(fileName).subscribe({
      next: (data) => this.workbookSections = data,
      error: (err) => {
      console.error(`File ${fileName} not found or inaccessible, loading default.`);
        this.loadWorkbook('guided_workbook_answers.txt');
        this.workbookSections = []
      }
    });
  }
}
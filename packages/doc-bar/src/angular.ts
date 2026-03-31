import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DocBar } from './core/DocBar.js';

/**
 * Angular wrapper for AppDocBar.
 *
 * This file is shipped as TypeScript source and compiled by Angular CLI
 * when the consumer builds their app.
 *
 * Usage (Angular 14+ standalone):
 *
 *   import { AppDocBarComponent } from '@bottomlessmargaritas/doc-bar/angular';
 *
 *   @Component({
 *     standalone: true,
 *     imports: [AppDocBarComponent],
 *     template: `<app-doc-bar appName="My App" theme="dark" />`,
 *   })
 *   export class MyPage {}
 *
 * Or with NgModule:
 *
 *   import { AppDocBarModule } from '@bottomlessmargaritas/doc-bar/angular';
 *
 *   @NgModule({ imports: [AppDocBarModule] })
 *   export class AppModule {}
 */
@Component({
  standalone: true,
  selector: 'app-doc-bar',
  template: '',
  host: { style: 'display: block' },
})
export class AppDocBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() basePath = '/.bottomlessmargaritas/application-documentation';
  @Input() position = 'bottom';
  @Input() fixed = true;
  @Input() appName = '';
  @Input() theme = 'dark';

  private instance: InstanceType<typeof DocBar> | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.mount();
  }

  ngOnChanges(): void {
    if (this.instance) {
      this.instance.destroy();
      this.mount();
    }
  }

  ngOnDestroy(): void {
    this.instance?.destroy();
  }

  private mount(): void {
    this.instance = new DocBar({
      basePath: this.basePath,
      position: this.position,
      fixed: this.fixed,
      appName: this.appName,
      theme: this.theme,
    });
    this.instance.mount(this.el.nativeElement);
  }
}

/** Convenience NgModule for non-standalone Angular apps. */
import { NgModule } from '@angular/core';

@NgModule({
  imports: [AppDocBarComponent],
  exports: [AppDocBarComponent],
})
export class AppDocBarModule {}

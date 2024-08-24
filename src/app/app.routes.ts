import { Routes } from '@angular/router';
import { HideImageComponent } from './features/hide-image/hide-image.component';
import { ExtractImageComponent } from './features/extract-image/extract-image.component';
import { HideTextComponent } from './features/hide-text/hide-text.component';
import { ExtractTextComponent } from './features/extract-text/extract-text.component';

export const routes: Routes = [
    { path: '', component: HideImageComponent },
    { path: 'hide-image', component: HideImageComponent },
    { path: 'extract-image', component: ExtractImageComponent },
    { path: 'hide-text', component: HideTextComponent },
    { path: 'extract-text', component: ExtractTextComponent },
];

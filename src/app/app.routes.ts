import { Routes } from '@angular/router';
import { HideImageComponent } from './features/hide-image/hide-image.component';
import { ExtractImageComponent } from './features/extract-image/extract-image.component';
import { HideTextComponent } from './features/hide-text/hide-text.component';
import { ExtractTextComponent } from './features/extract-text/extract-text.component';
import { appRoutes } from './constants/route-name.constatns';

export const routes: Routes = [
    { path: appRoutes.landing, component: HideImageComponent },
    { path: appRoutes.hideImage, component: HideImageComponent },
    { path: appRoutes.extractImage, component: ExtractImageComponent },
    { path: appRoutes.hideText, component: HideTextComponent },
    { path: appRoutes.extractText, component: ExtractTextComponent },
];

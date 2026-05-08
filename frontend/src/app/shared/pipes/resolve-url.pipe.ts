import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'resolveUrl',
  standalone: true
})
export class ResolveUrlPipe implements PipeTransform {
  transform(imageUrl: string | null | undefined): string | null {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    
    // Remove /api from the end of apiUrl if it exists
    const backendBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    
    // Ensure there is a slash between base and image URL
    const separator = imageUrl.startsWith('/') ? '' : '/';
    
    return `${backendBaseUrl}${separator}${imageUrl}`;
  }
}

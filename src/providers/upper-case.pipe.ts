import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'customuppercase'})
export class CustomUpperCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}

@Pipe({name: 'customlowercase'})
export class CustomLowerCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase();
  }
}
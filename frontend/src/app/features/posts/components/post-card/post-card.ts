import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  @Input({ required: true }) post!: Post;
}

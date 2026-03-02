import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ReviewerClient } from 'Clients/Reviewer/Reviewer.client';
import { IReviewerData } from 'Models/ClinicalVersion/ClinicalVersion.model';

@Injectable()
export class ReviewerService {
  constructor(@Inject(ReviewerClient) private reviewerClient: ReviewerClient) {}

  public async getReviewersByVersionId(
    clinicalVersionId: string,
  ): Promise<IReviewerData[]> {
    if (!clinicalVersionId) {
      throw new BadRequestException('Clinical version id must be defined');
    }

    return this.reviewerClient.getReviewersByVersionId(clinicalVersionId);
  }

  // Place holder for is reviewer checking for the roles
}

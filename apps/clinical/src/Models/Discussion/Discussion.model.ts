import { IsBoolean, IsOptional, IsString } from "class-validator";
import { ToBoolean } from "Utils/Transformers/ToBoolean.util";

export class UpdateDiscussionDTO {
  @IsOptional()
  @IsString()
  discussionTitle?: string;

  @IsOptional()
  @IsString()
  discussionNote?: string;
}

export class UpdateRecommendationDiscussionDTO {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  showInDiscussion?: boolean;
}

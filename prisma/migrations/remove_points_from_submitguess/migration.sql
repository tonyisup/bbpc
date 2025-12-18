create or alter procedure [dbo].[SubmitGuess] 
	@assignmentId uniqueidentifier,
	@guesserId nvarchar(1000),
	@hostId nvarchar(1000),
	@ratingId uniqueidentifier
as
begin
	set nocount on;

	begin try
		begin transaction;

		if not exists(select top 1 1 from [Assignment] where [id] = @assignmentId)
		begin
			if xact_state() <> 0 rollback transaction;
			return -1
		end

		if not exists(select top 1 1 from [User] where [id] = @guesserId)
		begin
			if xact_state() <> 0 rollback transaction;
			return -2
		end

		if not exists(select top 1 1 from [User] where [id] = @hostId)
		begin
			if xact_state() <> 0 rollback transaction;
			return -3
		end

		if not exists(select top 1 1 from [Rating] where [id] = @ratingId)
		begin
			if xact_state() <> 0 rollback transaction;
			return -4
		end

		declare @assignmentReviewId uniqueidentifier

		if not exists(
			select top 1 1 
			from [AssignmentReview] [ar]
			join [Review] [r]
				on [ar].[reviewId] = [r].[id]
				and [ar].[assignmentId] = @assignmentId
				and [r].[userId] = @hostId
		)
		begin
			declare @reviewId uniqueidentifier		
			declare @movieId uniqueidentifier
			declare @ids table ([id] uniqueidentifier)
			select top 1 @movieId = [movieId] from [Assignment] where [id] = @assignmentId

			insert into [Review] (
				[movieId],
				[userId],
				[ratingId]
			) 
			output [inserted].[id] into @ids
			values (
				@movieId,
				@hostId,
				null
			)
			select top 1 @reviewId = [id] from @ids

			insert into [AssignmentReview] (
				[assignmentId],
				[reviewId]
			)
			values (
				@assignmentId,
				@reviewId
			)
		end

		select @assignmentReviewId = [ar].[id]
		from [AssignmentReview] [ar]
		join [Review] [r]
			on [ar].[reviewId] = [r].[id]
			and [ar].[assignmentId] = @assignmentId
			and [r].[userId] = @hostId

		declare @seasonId uniqueidentifier
		select top 1 @seasonId = [id] from [Season] where [endedOn] is null order by [startedOn] desc
		 
		if not exists(
			select top 1 1
			from [Guess]
			where [userId] = @guesserId
			and [assignmntReviewId] = @assignmentReviewId
		)
		begin
			insert into Guess (
				[userId],
				[assignmntReviewId],
				[seasonId],
				[ratingId],
				[created]
			)
			values (
				@guesserId,
				@assignmentReviewId,
				@seasonId,
				@ratingId,
				getdate()
			)
		end
		else
		begin
			update [Guess]
			set 
				[ratingId] = @ratingId,
				[created] = getdate()
			where [userId] = @guesserId
			and [assignmntReviewId] = @assignmentReviewId
		end

		commit transaction;
		return 0;
	end try
	begin catch
		if xact_state() <> 0
		begin
			rollback transaction;
		end
		throw;
	end catch
end
GO



create or alter procedure [dbo].[SubmitGuess] 
	@assignmentId uniqueidentifier,
	@guesserId nvarchar(1000),
	@hostId nvarchar(1000),
	@ratingId uniqueidentifier
as
begin
	if not exists(select top 1 1 from [Assignment] where [id] = @assignmentId)
		return -1

	if not exists(select top 1 1 from [User] where [id] = @guesserId)
		return -2

	if not exists(select top 1 1 from [User] where [id] = @hostId)
		return -3

	if not exists(select top 1 1 from [Rating] where [id] = @ratingId)
		return -4

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
	select top 1 @seasonId = [id] from [Season]
	 
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
	return 0
end
GO



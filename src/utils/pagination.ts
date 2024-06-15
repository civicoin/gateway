interface Pagination {
	pageSize?: number
}

export interface CursorBasedPagination extends Pagination {
	cursor?: string
}

export interface OffsetPagination extends Pagination {
	page?: number
}

export const getPrismaOffsetPaginationArgs = (
	cursor?: string,
	pageSize: number = 10,
	cursorField = 'id' as const
) => ({
	take: pageSize,
	skip: !!cursor ? 1 : 0,
	cursor: cursor
		? {
				[cursorField]: cursor
			}
		: undefined
})

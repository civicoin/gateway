interface Pagination {
	pageSize?: number
}

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 25

export interface CursorBasedPagination extends Pagination {
	cursor?: string
}

export interface OffsetPagination extends Pagination {
	page?: number
}

export const getPrismaOffsetPaginationArgs = (
	cursor?: string,
	pageSize: number = DEFAULT_PAGE_SIZE,
	cursorField = 'id' as const
) => ({
	take: pageSize < MAX_PAGE_SIZE ? pageSize : MAX_PAGE_SIZE,
	skip: !!cursor ? 1 : 0,
	cursor: cursor
		? {
				[cursorField]: cursor
			}
		: undefined
})

/**
 * 日期格式化
 * date--> 可以是 时间戳 和 标准的日期格式
 * fmt 年月日时分秒 --> 'yyyy-MM-dd hh:mm:ss'
 * ex --> format(new Date(), 'yyyy-MM-dd hh:mm:ss')
 * -----> 2022-03-04 17:21:02
 */
export function formatTime(_date: Date | number, fmt: string = 'yyyy-MM-dd hh:mm:ss') {
	if (_date === null || _date === undefined || isNaN(_date as number)) {
		return 'error:not Date'
	}

	const date = new Date(_date);
	const o: Record<string, number> = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds(),
		'q+': Math.floor((date.getMonth() + 3) / 3),
		'S': date.getMilliseconds()
	};

	const yearMatch = /(y+)/.exec(fmt);
	if (yearMatch) {
		const yearMatchLength = yearMatch[0].length;
		fmt = fmt.replace(yearMatch[0], (date.getFullYear() + '').substr(4 - yearMatchLength));
	}

	for (const k in o) {
		const patternMatch = new RegExp(`(${k})`).exec(fmt);
		if (patternMatch) {
			const value = o[k].toString().padStart(patternMatch[0].length, '0');
			fmt = fmt.replace(patternMatch[0], value.substring(value.length - patternMatch[0].length));
		}
	}

	return fmt;
}
import csv from 'fast-csv';
import fs from 'fs';

const filename = 'size-list';

//load headers, rows
const { headers, rows } = await new Promise( resolve =>
	{
		const headers = [];
		const rows = [];
		csv.parseFile( filename + '.csv',
			{
				encoding: 'utf8',
				headers: true,
				strictColumnHandling: true,
				trim: true
			} )
			.on( 'headers', h => headers.push( ... h ) )
			.on( 'data', d => rows.push( d ) )
			.on( 'data-invalid', e => { throw e; } )
			.on( 'end', () => resolve( { headers, rows } ) );
	} );

//sort sanction-list
if( process.argv[2] === 'sort' || process.argv[2] === 'sort-compile' )
{
	rows.sort( ( a, b ) =>
		{
			if( a['item'] !== b['item'] )
				return a['item'].localeCompare( b['item'] );
			return parseInt( a['experience_id'] ) - parseInt( b['experience_id'] );
		} );
	csv.writeToPath( filename + '.csv', rows,
		{
			alwaysWriteHeaders: true,
			encoding: 'utf8',
			headers,
			writeBOM: true
		} );
}

//compile into machine lists
if( process.argv[2] === 'compile' || process.argv[2] === 'sort-compile' )
{
    //map rows into machine based rows
	//(have to copy into new objects so race condition doesn't change regular rows before they are written)
	const rows_machine = rows
        .map( r => {
			const obj = {};
			for (const h of headers) {
				obj[h] = r[h];
			}
			return obj;
		})
        .sort( ( a, b ) => {
            if( a['item'] !== b['item'] )
				return a['item'].localeCompare( b['item'] );
        } );

    fs.writeFileSync( filename + '.json', JSON.stringify( rows_machine ), { encoding: 'utf8' } );
}
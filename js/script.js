var youtubeModule = (function ($, doc) {
    var body = doc.getElementsByTagName("body")[0],
        TABLE_ID = 'list',
        nSortColumnIndex = 0,
		nDirection = 1,
		DATE_SEPARATOR = '/',
		TIME_SEPARATOR = ':';

	/**
	 * Get the time in mm:ss format
	 * @number seconds
	 * @returns {string}
	 */
	function getTime( seconds )
    {
        var nMinutes = Math.floor( seconds / 60 ),
            nSeconds = seconds - nMinutes * 60;

        return ( '00' + nMinutes ).slice(-2) + TIME_SEPARATOR + ( '00' + nSeconds ).slice(-2);
    }

	/**
	 * Returns the date in dd/mm/yyyy format
	 * @string dateString "2014-09-30T13:47:54.000Z"
	 * @returns {string}
	 */
    function getDate( dateString )
    {
        var oDate = new Date( dateString );

        return ( '00' + oDate.getDate() ).slice(-2) + DATE_SEPARATOR +
               ( '00' + ( oDate.getMonth() + 1 ) ).slice(-2)  + DATE_SEPARATOR +
               oDate.getFullYear() ;
    }

    function sortColumnByType( evt )
    {
        var oTarget = evt.target,
            oParent = oTarget.parentNode,
            sColType,
            i,
            oTable = doc.getElementById( TABLE_ID ),
            nLen = oTable.rows.length,
            newTable = [],
			nNlen = nLen - 1,
            oFragment;

        if ( oTarget.className.indexOf('arrow') != -1 )
        {
			nDirection = oTarget.className.split(" ")[1] === "up" ? 1 : -1;
            nSortColumnIndex = oParent.cellIndex;
            sColType = oParent.getAttribute( 'data-type' );

            // row 0 is thead, is not added in newTable
            for ( i=1; i < nLen; i++ ) {
                newTable[i-1] = oTable.rows[i];
            }

            switch (sColType) {
                case '1': sortFn = sortString;
                    break;
                case '2': sortFn = sortTime;
                    break;
                case '3': sortFn = sortDateTime;
                    break;
            }

			newTable.sort(sortFn);
			oTarget.style.display = 'none';

			if ( nDirection > 0 )
            {
				oTarget.previousElementSibling.style.display = 'block';
            }
            else
            {
				oTarget.nextElementSibling.style.display = 'block';
            }

			oFragment = doc.createDocumentFragment();
            for ( i=0; i < nNlen; i++ )
            {
                oFragment.appendChild( newTable[i] );
            }
            oTable.tBodies[0].appendChild( oFragment );
        }
    }

    function sortString( row1, row2 )
    {
        var sCell1 = getCellValue( row1 ),
            sCell2 = getCellValue( row2 );

        return nDirection * sCell1.localeCompare(sCell2);
    }

	/**
	 * Sort time in format mm:ss
	 * @param row1
	 * @param row2
	 * @returns {number}
	 */
	function sortTime( row1, row2 )
    {
		var oRegex = /([\d]+):([\d]+)/,
			aTime1 = getCellValue( row1 ).match( oRegex ),
			aTime2 = getCellValue( row2 ).match( oRegex );
			fTime1 = parseInt(aTime1[1]) * 60 + parseInt(aTime1[2]),
			fTime2 = parseInt(aTime2[1]) * 60 + parseInt(aTime2[2]);

		return ( fTime1 === fTime2 ) ? 0 : ( nDirection * ( fTime1 > fTime2 ? 1 : -1 ) );
    }

	/**
	 * Sort table by date column
	 * @object row1 table tr
	 * @object row2 table tr
	 * @returns {number} 0: equal dates, 1: date1>date2, -1: date1<date2
	 */
    function sortDateTime( row1, row2 )
    {
		var sDate1 = getCellValue( row1 ).split( DATE_SEPARATOR ).reverse().join(","),
			sDate2 = getCellValue( row2 ).split( DATE_SEPARATOR ).reverse().join("," );

		return ( sDate1 === sDate2 ? 0 : nDirection * ( new Date( sDate1 ) > new Date( sDate2 ) ? 1 : -1 ) );
    }

	/**
	 * Gets the value from row cell and column nSortColumnIndex
	 * @object cell the table row (tr)
	 * @returns {string}
	 */
	function getCellValue( cell )
	{
		return cell.cells[nSortColumnIndex].innerHTML.trim().toLowerCase()
	}

    return {
        loadYoutubeVideos: function()
        {
            $.ajax({
                url: "youtube-videos.json",
                dataType: 'json',
                success: function( response )
                {
                    var aData = response.data.items,
                        aItems = [],
                        i,
                        nLength = aData.length,
                        oTable,
                        oVideoData,
                        sArrows;

                    for (i = 0; i < nLength; i++ )
                    {
                        oVideoData = aData[i];
                        aItems.push( '<tr id="' + oVideoData.id + '">' +
                                        '<td>' + oVideoData.title + '</td>' +
                                        '<td>' + oVideoData.description + '</td>' +
                                        '<td>' + getTime(oVideoData.duration) + '</td>' +
                                        '<td>' + getDate(oVideoData.uploaded) + '</td>' +
                                        '<td><button class="show-thumb" data-img="' + oVideoData.thumbnail.sqDefault + '">Show image</button></td>' +
                            '</tr>' );
                    }

                    if ( !!nLength )
                    {
                        oTable = doc.createElement( 'table' );
                        oTableBody = doc.createElement( 'tbody' );
                        oTHead = doc.createElement( 'thead' );
                        sArrows = '<div class="arrow down" title="down"></div><div class="arrow up" title="up"></div>';
                        oTHead.innerHTML = '<thead><tr>' +
                                                '<th data-type="1" class="header">Title'+ sArrows + '</th>' +
                                                '<th data-type="1" class="header">Description'+ sArrows + '</th>' +
                                                '<th data-type="2" class="header">Duration'+ sArrows + '</th>' +
                                                '<th data-type="3" class="header">Uploaded'+ sArrows + '</th>' +
                                                '<th></th>' +
                                                '</tr></thead>';

                        oTableBody.innerHTML += aItems.join('');
                        oTable.className = TABLE_ID;
                        oTable.id = TABLE_ID;
                        oTable.appendChild(oTHead);
                        oTable.appendChild(oTableBody);
                        body.insertBefore( oTable, doc.getElementById( 'thumbnail-hq' ) );

                        $('.show-thumb').on( 'click' , function() {
                            $('#thumbnail-hq').attr('src', this.getAttribute('data-img'));
                            window.scrollTo(0, body.scrollHeight);
                        } );

                        $('.header').on('click', sortColumnByType);
                    }
                },
                error: function( jqXHR, textStatus, errorThrown )
                {
                    console.warn(textStatus + ' ' + errorThrown);
                }
        })
    }
}} (jQuery, document));

youtubeModule.loadYoutubeVideos();
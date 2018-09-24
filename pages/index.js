// pages/index.js
import Link from 'next/link'
import React from 'react'

export default class extends React.Component {
    static async getInitialProps({ req }) {
        console.log({req})
    return { lyrics: req.pageData }
    }
  render() {
    const {lyrics} = this.props;

    const htmlLyrics = lyrics
      .map(obj => JSON.parse(obj).lyrics)
      .map(l => l.replace(/\n/g, "<br />"));
    function createMarkup() { return {__html: htmlLyrics}; };
    return (
        <div>
            <Link prefetch href="/beatles">
              Beatles
            </Link>{' '}
            <Link prefetch href="/metallica">
              Metallica
            </Link>{' '}
            {htmlLyrics.length > 0 ? <div dangerouslySetInnerHTML={createMarkup()} /> :
            <p>Désolé, apparemment alex ne connait pas ce groupe</p>}
        </div>

    )
  }
}

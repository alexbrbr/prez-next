// pages/index.js
require('isomorphic-fetch');
import Link from 'next/link'
import React from 'react'

export default class extends React.Component {
  static async getInitialProps({ req }) {
    const res = await fetch('https://api.github.com/repos/zeit/next.js')
    const json = await res.json()
    return { stars: json.stargazers_count }
  }

  render() {
    const { stars } = this.props;
    return (
        <div>
            <p>
            👋 la bouffe front 😻
            </p>
            <p>
            Next stars: {stars}
            </p>
            <Link prefetch href="/cow">
              Meuh
            </Link>{' '}
        </div>
    
    )
  }
}

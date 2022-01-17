import React from 'react';
import MDSpinner from 'react-md-spinner';
import { Results, ResultType } from '../home/scenarios/ScenarioResults';

interface MyProps {
  resultType: ResultType,
  results: Results
}

export default function ResultCard (props: MyProps) {
  const { resultType, results } = props;
  return (
    <div>
      <h4>{resultType.toUpperCase()}</h4>
      {!results.isFetching ? (
        <ul>
          {results.results.map(result => (
            <li key={result.id}>{result.result_type.name}</li>
          ))}
        </ul>
      ) : (
        <MDSpinner />
      )}
    </div>
  )
}
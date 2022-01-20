import React from 'react';
import ResultCard from '../../components/ResultCard';
import { useRecursiveFetch } from '../../hooks';

interface MyProps {
  uuid: string
}

export default function ScenarioResults (props: MyProps) {
  const { uuid } = props;

  const {
    data: rawResults,
    isFetching: rawResultsIsFetching
  } = useRecursiveFetch(`/api/v4/scenarios/${uuid}/results/raw/`, {});

  const {
    data: basicResults,
    isFetching: basicResultsIsFetching
  } = useRecursiveFetch(`/api/v4/scenarios/${uuid}/results/basic/`, {});

  const {
    data: arrivalResults,
    isFetching: arrivalResultsIsFetching
  } = useRecursiveFetch(`/api/v4/scenarios/${uuid}/results/arrival/`, {});

  const {
    data: damageResults,
    isFetching: damageResultsIsFetching
  } = useRecursiveFetch(`/api/v4/scenarios/${uuid}/results/damage/`, {});

  return (
    <div>
      <ResultCard
        resultType='raw'
        results={{
          isFetching: rawResultsIsFetching,
          results: rawResults
        }}
      />
      <ResultCard
        resultType='basic'
        results={{
          isFetching: basicResultsIsFetching,
          results: basicResults
        }}
      />
      <ResultCard
        resultType='arrival'
        results={{
          isFetching: arrivalResultsIsFetching,
          results: arrivalResults
        }}
      />
      <ResultCard
        resultType='damage'
        results={{
          isFetching: damageResultsIsFetching,
          results: damageResults
        }}
      />
    </div>
  )
}
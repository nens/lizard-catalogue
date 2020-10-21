import React, { useState } from 'react';
import './../styles/SelectBox.css';

interface Props {
    name: string,
    value: string | null,
    choices: [string, string][],
    handleEnter: (e: any) => void,
    valueChanged: Function,
    placeholder?: string,
    showSearchField?: boolean
    readonly?: boolean
};

const SelectBox: React.FC<Props> = (props) => {
    const {
        name,
        value,
        choices,
        valueChanged,
        placeholder,
        showSearchField,
        readonly,
        // handleEnter
    } = props;

    const [searchInput, setSearchInput] = useState<string>('');
    const [showChoices, setShowChoices] = useState<boolean>(false);

    const handleKeyUp = (e: any) => {
        if (e.key === 'Escape') {
            setShowChoices(false);
        };
    };
    const clearInput = () => {
        valueChanged('');
        setShowChoices(false);
    };

    return (
        <div className={`select-box form-input`}>
            <input
                style={{ caretColor: "transparent" }}
                id={`selectbox-${name}`}
                tabIndex={-1}
                type="text"
                autoComplete="false"
                className={"select-box-input"}
                placeholder={placeholder}
                value={value || ""}
                onClick={() => !readonly && setShowChoices(!showChoices) && setSearchInput('')}
                onKeyUp={e => !readonly && handleKeyUp(e)}
                onChange={() => { }}
                readOnly={readonly}
                disabled={readonly}
            />
            {
                !readonly ?
                    value !== null ? (
                        <button onClick={() => clearInput()}>x</button>
                    ) : (
                            <button onClick={() => setShowChoices(true)}>&#8595;</button>
                        ) : null
            }
            {showChoices ? (
                <div className={'results'}>
                    {showSearchField ? (
                        <input
                            id={`searchbox-${name}`}
                            name={`searchbox-${name}`}
                            type="text"
                            autoComplete="false"
                            autoFocus={true}
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyUp={handleKeyUp}
                        />
                    ) : null}
                    {choices.map((choice, i) => {
                        const choiceDisplay = choice[0];
                        const choiceValue = choice[1];
                        const isSelected = choiceValue === value;

                        if (
                            searchInput &&
                            choiceDisplay.toLowerCase().indexOf(searchInput.toLowerCase()) === -1
                        ) {
                            return null; // Hide
                        }

                        return (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "start"
                                }}
                                tabIndex={i + 1}
                                key={choiceValue + i}
                                className={`result-row ${isSelected ? 'result-row-active' : 'result-row-inactive'}`}
                                onMouseDown={() => {
                                    setShowChoices(false)
                                    valueChanged(choiceValue);
                                }}
                            >
                                {choiceDisplay}
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    )
}

export default SelectBox;
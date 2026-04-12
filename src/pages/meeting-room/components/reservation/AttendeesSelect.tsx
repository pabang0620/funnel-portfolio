import { useMemo } from 'react';
import Select, { type MultiValue, type StylesConfig } from 'react-select';
import { useSlackMembers } from '../../hooks/useSlackMembers';

interface OptionType {
  value: string;
  label: string;
}

interface AttendeesSelectProps {
  value: string[];
  onChange: (emails: string[]) => void;
}

export function AttendeesSelect({ value, onChange }: AttendeesSelectProps) {
  const { members, loading, error } = useSlackMembers();

  const options: OptionType[] = useMemo(() => {
    return members.map((member) => ({
      value: member.email,
      label: `${member.real_name} (${member.email})`,
    }));
  }, [members]);

  const selectedOptions: OptionType[] = useMemo(() => {
    return value.map((email) => {
      const member = members.find((m) => m.email === email);
      return {
        value: email,
        label: member ? `${member.real_name} (${member.email})` : email,
      };
    });
  }, [value, members]);

  const handleChange = (newValue: MultiValue<OptionType>) => {
    const emails = newValue.map((option) => option.value);
    onChange(emails);
  };

  const customStyles: StylesConfig<OptionType, true> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
      backgroundColor: 'hsl(var(--background))',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.5)' : 'none',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary))'
        : state.isFocused
        ? 'hsl(var(--accent))'
        : 'transparent',
      color: state.isSelected
        ? 'hsl(var(--primary-foreground))'
        : 'hsl(var(--foreground))',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'hsl(var(--primary))',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--secondary))',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'hsl(var(--secondary-foreground))',
      padding: '2px 6px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'hsl(var(--secondary-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
    }),
    input: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
  };

  if (error) {
    return (
      <div className="text-sm text-muted-foreground">
        Slack 멤버를 불러올 수 없습니다. 직접 입력해주세요.
      </div>
    );
  }

  return (
    <Select<OptionType, true>
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      isLoading={loading}
      placeholder="참석자 이름 또는 이메일 입력..."
      noOptionsMessage={() => '검색 결과가 없습니다'}
      loadingMessage={() => 'Slack 멤버 불러오는 중...'}
      isClearable
      backspaceRemovesValue={false}
      styles={customStyles}
      className="basic-multi-select"
      classNamePrefix="select"
    />
  );
}

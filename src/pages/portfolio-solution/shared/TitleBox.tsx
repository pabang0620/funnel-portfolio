interface TitleBoxProps {
  mainmenu: string
  submenu?: string
}

const TitleBox = ({ mainmenu, submenu }: TitleBoxProps) => {
  return (
    <div className="titleBox">
      <p>{mainmenu}</p>
      {submenu && <p>{submenu}</p>}
    </div>
  )
}

export default TitleBox

import { Card } from 'reactstrap';
import '../../assets/css/item.css';
import { useSelector } from 'react-redux';
function Item({ additionalClass, icon, name, value, unit, max, min, change, stateVi, stateEn, adviceVi, adviceEn,safe}) {
    const language = useSelector((state) => state.language.language);
    let changeText;
    let safeText;
  if (change === 'Tăng') {
    changeText = language === 'en' ? 'Increased' : 'Tăng';
  } else if (change === 'Giảm') {
    changeText = language === 'en' ? 'Decreased' : 'Giảm';
  } else {
    changeText = language === 'en' ? 'No change' : 'Không thay đổi';
  }

  if (safe === true) {
    safeText = language === 'en' ? 'Safe' : 'An toàn';
  } 
  else {
    safeText = language === 'en' ? 'No safe' : 'Không an toàn';
  }
  const safeTextColor = safe ? 'rgb(1, 181, 116)' : '#FF0000';
    return (
        <Card
            className={`card-chart ${additionalClass.additionalClass === 'additional-white-class' ? 'white-content' : ''}`}
            style={{ borderRadius: '20px' }}
        >
            <div class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-1tke72g">
                <div class="MuiBox-root css-7wmvu8">
                    <div class="MuiBox-root css-7wmvu8">
                        <div class="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-undefined css-v3z1wi">
                            <div class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-8 css-18phfu2">
                                <div class="MuiBox-root css-1ie9lhf">
                                    <span class="MuiTypography-root MuiTypography-caption css-17x5xym">
                                        {name}
                                    </span>
                                    <h6 class="MuiTypography-root MuiTypography-subtitle1 css-1br58i5">
                                        {value}{' '}
                                        <span class="MuiTypography-root MuiTypography-button css-7d00n7">
                                            {unit}
                                        </span>
                                    </h6>
                                </div>
                                <div className='minmaxAttribute'>
                                    <div style={{marginLeft:"1rem"}}>
                                    <p>{language === 'en' ? `Max | ${max} ${unit}` : `Cao nhất | ${max} ${unit}`}</p>
                                    <p>{language === 'en' ? `Min | ${min} ${unit}` : `Thấp nhất | ${min} ${unit}`}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-4 css-nbt530">
                                <div class="MuiBox-root css-uo81m3">
                                    <span class="material-icons">{icon}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'center',gap:'1.5rem'}}> 
                        <p style={{ color: safeTextColor, fontWeight:'bold'}}>{safeText}</p>
                                        <p>{changeText}</p>
                        </div>
                        <p style={{fontWeight:"bold", color:"rgb(1, 181, 116)"} }>{language === 'en' ? `State:  ${stateEn}` : `Trạng thái: ${stateVi}`}</p>
                        <p className='advice-paragraph'> <span>{language === 'en' ? `Advice:  ${adviceEn}` : `Lời khuyên: ${adviceVi}`}</span></p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default Item;

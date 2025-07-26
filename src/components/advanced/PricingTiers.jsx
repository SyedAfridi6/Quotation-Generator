import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatting';
import '../ui/styles/PricingTiers.css';

const PricingTiers = ({ pricingTiers, currency }) => {
  const tiers = Array.isArray(pricingTiers) ? pricingTiers : [];

  return (
    <section className="pricing-tiers">
      <header className="pricing-header" role="banner">
        <h3>Alternative Pricing Options</h3>
        <p>Choose the package that best fits your needs and budget</p>
      </header>

      <div className="tiers-container" role="list">
        {tiers.map((tier, idx) => (
          <article
            key={idx}
            className={`tier-card${tier.recommended ? ' recommended' : ''}`}
            role="listitem"
            tabIndex={0}
            aria-label={`${tier.name} plan, price ${formatCurrency(tier.price, currency)}`}
          >
            {tier.recommended && (
              <div className="recommended-badge" aria-label="Recommended plan">
                ★ Recommended
              </div>
            )}

            <header className="tier-header">
              {tier.icon && (
                <div className="tier-icon" aria-hidden="true">
                  {typeof tier.icon === 'string' ? (
                    <img src={tier.icon} alt="" />
                  ) : (
                    tier.icon
                  )}
                </div>
              )}
              <h4 className="tier-name">{tier.name}</h4>
              <div className="tier-price">{formatCurrency(tier.price, currency)}</div>
              <p className="tier-description">{tier.description}</p>
            </header>

            <section className="tier-content">
              {tier.team && tier.team.length > 0 && (
                <div className="tier-team" aria-label="Team composition">
                  <h5>Team Composition</h5>
                  <ul>
                    {tier.team.map((member, i) => (
                      <li key={i}>
                        {member.level} {member.role.replace(/([A-Z])/g, ' $1').trim()}
                        {member.allocation ? ` (${Math.round(member.allocation * 100)}%)` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="tier-features" aria-label="Included features">
                <h5>Included Features</h5>
                <ul>
                  {(tier.features || []).map((feature, i) => (
                    <li
                      key={i}
                      className={feature.included ? 'included' : 'not-included'}
                      aria-checked={feature.included}
                      role="checkbox"
                      tabIndex={-1}
                    >
                      <i className={feature.included ? 'fas fa-check' : 'fas fa-times'} aria-hidden="true" />
                      {typeof feature === 'string' ? feature : feature.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tier-details">
                <div className="detail-item" aria-label="Timeline">
                  <span>Timeline:</span>
                  <span>{tier.timeline} weeks</span>
                </div>
                {tier.limitations && tier.limitations.length > 0 && (
                  <div className="tier-limitations" aria-label="Limitations">
                    <h5>Limitations</h5>
                    <ul>
                      {tier.limitations.map((limit, i) => (
                        <li key={i}>{limit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <footer className="tier-footer">
              <button className="select-tier-btn" type="button">
                Select {tier.name}
              </button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
};

PricingTiers.propTypes = {
  pricingTiers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      savings: PropTypes.number,
      recommended: PropTypes.bool,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
      timeline: PropTypes.number.isRequired,
      revisions: PropTypes.string,
      features: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          included: PropTypes.bool.isRequired,
        })
      ).isRequired,
      team: PropTypes.arrayOf(
        PropTypes.shape({
          level: PropTypes.string,
          role: PropTypes.string,
          allocation: PropTypes.number,
        })
      ),
      limitations: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  currency: PropTypes.string.isRequired,
};

export default PricingTiers;
